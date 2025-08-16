import express from 'express';
import { fetch } from 'undici';

// 타입 정의 / Type definitions
interface ContextItem {
  text: string;
  [key: string]: any;
}

interface PrepareResponse {
  context: ContextItem[];
  docRefs: any[];
}

// Express 앱 초기화 / Initialize Express app
const app = express();
app.use(express.json({ limit: '2mb' }));

// 환경 변수 설정 / Environment variables configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const N8N_PREPARE_URL = process.env.N8N_PREPARE_URL;
const N8N_UPSERT_URL = process.env.N8N_UPSERT_URL;
const PORT = Number(process.env.GATEWAY_BIND_PORT || 11434);

// RAG 설정 / RAG configuration
const RAG_TOPK = Number(process.env.RAG_TOPK || 12);
const RERANK_TOPN = Number(process.env.RERANK_TOPN || 5);

// 컨텍스트 블록 생성 함수 / Function to build context block
function buildContextBlock(items: ContextItem[] = []): string {
  if (!items.length) return '';
  const lines = items.map((it, i) => `- [${i+1}] ${it.text?.slice(0, 1200) || ''}`);
  return `### Retrieved Context\n${lines.join('\n')}\n---\n`;
}

// 헬스 체크 엔드포인트 / Health check endpoints
app.get('/healthz', (req, res) => {
  // 기본 헬스 체크 (의존성 없음) / Basic health check (no dependencies)
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ollama-rag-gateway'
  });
});

app.get('/readyz', async (req, res) => {
  // 준비 상태 체크 (업스트림 서비스 확인) / Readiness check (check upstream services)
  const checks = {
    ollama: false,
    n8n_prepare: null as boolean | null,
    n8n_upsert: null as boolean | null,
    timestamp: new Date().toISOString()
  };

  try {
    // Ollama 서비스 체크 / Check Ollama service
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/tags`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    checks.ollama = ollamaResponse.ok;
  } catch (e) {
    checks.ollama = false;
  }

  try {
    // n8n prepare 서비스 체크 (설정된 경우) / Check n8n prepare service (if configured)
    if (N8N_PREPARE_URL) {
      const prepareResponse = await fetch(N8N_PREPARE_URL, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      checks.n8n_prepare = prepareResponse.ok;
    } else {
      checks.n8n_prepare = null; // 설정되지 않음 / Not configured
    }
  } catch (e) {
    checks.n8n_prepare = false;
  }

  try {
    // n8n upsert 서비스 체크 (설정된 경우) / Check n8n upsert service (if configured)
    if (N8N_UPSERT_URL) {
      const upsertResponse = await fetch(N8N_UPSERT_URL, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      checks.n8n_upsert = upsertResponse.ok;
    } else {
      checks.n8n_upsert = null; // 설정되지 않음 / Not configured
    }
  } catch (e) {
    checks.n8n_upsert = false;
  }

  // 필수 서비스 (Ollama)가 정상이면 200, 아니면 503 / Return 200 if essential service (Ollama) is healthy, otherwise 503
  const isReady = checks.ollama;
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    checks
  });
});

// 채팅 API 엔드포인트 / Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body || {};
    const { messages = [], model = 'qwen3:0.6b', stream = true, options = {}, session_id, thread_id } = body;

    // 1) 마지막 user 메시지 추출 / Extract last user message
    const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    // 2) n8n prepare 호출 (임베딩→검색→리랭크→컨텍스트) / Call n8n prepare (embedding→search→rerank→context)
    let ctx: PrepareResponse = { context: [], docRefs: [] };
    if (N8N_PREPARE_URL && userMsg) {
      const prep = await fetch(N8N_PREPARE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          session_id, thread_id,
          topk: RAG_TOPK, topn: RERANK_TOPN
        })
      });
      if (prep.ok) {
        const prepResult = await prep.json() as PrepareResponse;
        ctx = prepResult;
      }
    }

    // 시스템 메시지 구성 / Compose system messages
    const sys = { role: 'system', content: 'You are a helpful assistant. Use the context if relevant.' };
    const ctxBlock = ctx?.context?.length ? { role: 'system', content: buildContextBlock(ctx.context) } : null;
    const outMessages = ctxBlock ? [sys, ctxBlock, ...messages] : [sys, ...messages];

    // 3) Ollama로 스트리밍 중계 / Stream relay to Ollama
    const ollamaResp = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages: outMessages, stream: true, options })
    });

    // 응답 헤더 설정 / Set response headers
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');

    let assistantFull = '';
    
    // 응답 바디가 존재하는지 확인 / Check if response body exists
    if (ollamaResp.body) {
      for await (const chunk of ollamaResp.body) {
        const text = Buffer.from(chunk).toString('utf8');
        res.write(text); // 그대로 중계(JSONL) / Relay as-is (JSONL)
        
        // 응답 누적(간단 파서) / Accumulate response (simple parser): {"message":{"content":"...","role":"assistant"}, "done":false}
        const lines = text.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const j = JSON.parse(line);
            if (j?.message?.content) assistantFull += j.message.content;
          } catch {}
        }
      }
    }
    res.end();

    // 4) 사후 업서트 호출 / Post upsert call
    if (N8N_UPSERT_URL && assistantFull?.trim()) {
      fetch(N8N_UPSERT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id, thread_id,
          question: userMsg,
          answer: assistantFull,
          refs: ctx?.docRefs || []
        })
      }).catch(()=>{});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'gateway_error', detail: String(e) });
  }
});

// 임베딩 API 패스스루 / Embeddings API passthrough
app.post('/api/embeddings', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST', 
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    res.status(r.status);
    res.setHeader('content-type', r.headers.get('content-type') || 'application/json');
    res.send(await r.text());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'embeddings_error', detail: String(e) });
  }
});

// 서버 시작 / Start server
app.listen(PORT, () => console.log(`[gateway] listening on ${PORT}`));
