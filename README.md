# Local RAG (App with n8n Orchestration)
An Open AI compatible proxy app that preserves JSONL streaming while delegating Retrieval-Augmented Generation (RAG) preparation and post-upsert to n8n. Drop-in endpoint replacement for existing Ollama clients; switch the base URL to the app and get consistent context-aware answers with minimal client changes.

## 📋 Prerequisites / 사전 요구사항

### Required Services / 필수 서비스
- **Ollama Server**: Running and accessible (e.g., `http://localhost:11434`)
  - 설치: [ollama.com](https://ollama.com) 또는 `curl -fsSL https://ollama.com/install.sh | sh`
  - 모델 다운로드: `ollama pull qwen2:7b` (또는 원하는 모델)

### Development Environment / 개발 환경
- **Node.js 20+**: [nodejs.org](https://nodejs.org) 또는 `winget install OpenJS.NodeJS`
- **PowerShell 5.1+**: Windows에 기본 설치됨 / Pre-installed on Windows
- **Git**: [git-scm.com](https://git-scm.com) 또는 `winget install Git.Git`

### Optional for Full RAG / RAG 전체 기능용 (선택사항)
- **n8n Workflow Engine**: RAG orchestration을 위해 / For RAG orchestration
  - Docker: `docker run -p 5678:5678 n8nio/n8n`
  - 또는 [n8n.io 설치 가이드](https://docs.n8n.io/hosting/installation/)
- **Vector Database (Qdrant)**: 문서 저장용 / For document storage
  - Docker: `docker run -p 6333:6333 qdrant/qdrant`
- **Text Embeddings Inference (TEI)**: 임베딩 생성용 / For embedding generation
  - 또는 다른 임베딩 서비스 (OpenAI API, 로컬 모델 등)

### Network Requirements / 네트워크 요구사항
- **인터넷 연결**: npm 패키지 설치용 / Internet connection for npm packages
- **포트 접근**: 11434 (앱), 11434 (Ollama), 5678 (n8n), 6333 (Qdrant)
- **방화벽 설정**: 필요한 포트들이 열려있어야 함 / Required ports should be open

## 🚀 Current Implementation Status / 현재 구현 상태

### ✅ Completed Features / 완료된 기능
- **Core Gateway**: Ollama-compatible proxy with full JSONL streaming
- **TypeScript Support**: Complete TypeScript setup with build scripts  
- **RAG Integration**: n8n webhook integration for prepare and upsert
- **Streaming Relay**: Byte-for-byte NDJSON passthrough from Ollama
- **Context Injection**: Automatic system message and context block insertion
- **Error Handling**: Graceful fallback when RAG services are unavailable
- **Environment Configuration**: All major settings via environment variables

### ✅ Recently Completed / 최근 완료
- **Health Check Endpoints**: `/healthz` and `/readyz` with upstream service monitoring
- **Docker Multi-stage Build**: Optimized containerization with security best practices
- **CI/CD Pipeline**: Complete GitHub Actions workflow with GHCR publishing and security scanning

### 🔄 In Progress / 진행 중
- Metrics and observability improvements
- Security scanning integration testing

### 📋 Planned / 계획됨
- n8n workflow templates
- Portainer deployment stack refinements
- Advanced security features (auth, rate limiting)

## 📄 License / 라이센스

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Open Source Dependencies / 오픈소스 의존성
This project uses the following open source packages:
- **Express.js** - MIT License
- **undici** - MIT License  
- **TypeScript** - Apache-2.0 License
- **Node.js** - MIT License

### Contributing / 기여하기
Contributions are welcome! Please feel free to submit a Pull Request.

## Quick Test - 현재 테스트 가능 / Currently Testable
✅ **서버가 포트 11434에서 실행 중** / **Server running on port 11434**

After deployment, replace your client's Ollama base URL with the app URL (port 11434). Or test with curl from PowerShell:

```powershell
# 현재 작동하는 테스트 / Currently working test ✅
curl.exe http://localhost:11434/api/chat -H "Content-Type: application/json" -d '{
	"model": "qwen3:0.6b",
	"messages": [ { "role": "user", "content": "Hello, how are you?" } ],
	"stream": true
}'
```

✅ You should receive streaming NDJSON, the same format as native Ollama.

**헬스 체크 테스트 / Health check test:**
```powershell
# 기본 헬스 체크 / Basic health check
curl.exe http://localhost:11434/healthz

# 준비 상태 체크 (업스트림 서비스 포함) / Readiness check (including upstream services)  
curl.exe http://localhost:11434/readyz
```

**실제 RAG 기능 테스트 / RAG functionality test:**
- N8N_PREPARE_URL과 N8N_UPSERT_URL을 설정하면 RAG 기능이 활성화됩니다 / Set N8N_PREPARE_URL and N8N_UPSERT_URL to enable RAG functionality
- 현재는 n8n 없이도 기본 Ollama 프록시로 작동합니다 / Currently works as basic Ollama proxy without n8nent Implementation Status
✅ **POST `/api/chat`** - **완전 구현됨 / Fully Implemented**
- Request: Ollama-compatible `{ model, messages[], stream=true, options?, session_id?, thread_id? }`
- Behavior: ✅ Streams NDJSON lines identical to Ollama's `/api/chat`. Adds a system message and, if available, a context block from n8n.

✅ **POST `/api/embeddings`** - **완전 구현됨 / Fully Implemented**
- Behavior: ✅ Pass-through proxy to `OLLAMA_URL/api/embeddings`.

✅ **Health Endpoints** - **완전 구현됨 / Fully Implemented**
- `/healthz` → `200` (no deps): Basic health check without dependencies
- `/readyz` → checks upstream services: Validates Ollama and n8n service availabilityshile delegating Retrieval-Augmented Generation (RAG) preparation and post-upsert to n8n. Drop-in endpoint replacement for existing Ollama clients; switch the base URL to the app and get consistent context-aware answers with minimal client changes.

## 🚀 Current Implementation Status / 현재 구현 상태

### ✅ Completed Features / 완료된 기능
- **Core Gateway**: Ollama-compatible proxy with full JSONL streaming
- **TypeScript Support**: Complete TypeScript setup with build scripts  
- **RAG Integration**: n8n webhook integration for prepare and upsert
- **Streaming Relay**: Byte-for-byte NDJSON passthrough from Ollama
- **Context Injection**: Automatic system message and context block insertion
- **Error Handling**: Graceful fallback when RAG services are unavailable
- **Environment Configuration**: All major settings via environment variables

### 🔄 In Progress / 진행 중
- Health check endpoints (`/healthz`, `/readyz`)
- Docker containerization
- Metrics and observability

### 📋 Planned / 계획됨
- n8n workflow templates
- Portainer deployment stack
- CI/CD pipeline for container builds
- Advanced security features (auth, rate limiting)

## Why this design
- Gateway handles real-time JSONL streaming to clients. n8n focuses on RAG prep (embed → search → rerank) and post-processing (re-embedding/upsert), which don’t need streaming.
- Clean separation improves reliability, scalability, and maintainability. Swap RAG components (Qdrant/TEI today; Elastic/ColBERT or GraphRAG tomorrow) without touching clients.
- Easy to ship end-to-end: GitHub → GHCR (or Docker Hub) → Portainer Stack.

## Repository layout
```
repo root
├─ app/                       # Node/Express proxy – Ollama-compatible ✅ 구현됨 / Implemented
│  ├─ Dockerfile              # 🔄 구현 예정 / To be implemented
│  ├─ package.json            # ✅ TypeScript 설정 완료 / TypeScript configured
│  ├─ tsconfig.json           # ✅ TypeScript 설정 완료 / TypeScript configured
│  └─ src/
│     └─ server.ts            # ✅ 핵심 기능 구현 완료 / Core functionality implemented
├─ workflows/                 # n8n exported workflows (import in n8n)
│  └─ rag-prepare-upsert.json # 🔄 구현 예정 / To be implemented
├─ compose/
│  ├─ docker-compose.yml      # 🔄 구현 예정 / To be implemented - Optional: compose up for local/edge
│  └─ portainer-stack.yml     # 🔄 구현 예정 / To be implemented - Use in Portainer as a Git/Repository stack
└─ README.md                  # ✅ 문서화됨 / Documented
```

## How it works
1) Client POSTs to the app at `/api/chat` (same payloads as Ollama).  
2) App extracts the last user message and calls n8n webhook `/webhook/rag/prepare` to get retrieved context and document refs.  
3) App composes messages: system prompt + context block + original conversation.  
4) App calls Ollama `/api/chat?stream=true` and relays JSONL chunks unchanged to the client.  
5) After completion, app calls n8n `/webhook/rag/upsert` with the Q/A and refs to store embeddings and upsert into the vector DB.

Key properties:
- Full JSONL streaming preserved (`Content-Type: application/x-ndjson`).
- Embeddings endpoint `/api/embeddings` is proxied pass-through to Ollama by default.
- Policy knobs (top-k, rerank top-n, thresholds, fallback) are environment-driven.

## Runtime configuration (env) - 현재 구현 상태 / Current Implementation Status
- ✅ **OLLAMA_URL**: Base URL of your Ollama server (e.g., http://ollama:11434) - **구현됨 / Implemented**
- ✅ **N8N_PREPARE_URL**: n8n webhook for RAG prepare (e.g., http://n8n:5678/webhook/rag/prepare) - **구현됨 / Implemented**
- ✅ **N8N_UPSERT_URL**: n8n webhook for RAG upsert (e.g., http://n8n:5678/webhook/rag/upsert) - **구현됨 / Implemented**
- ✅ **GATEWAY_BIND_PORT**: Port to expose (default 11434 for Ollama compatibility) - **구현됨 / Implemented**
- ✅ **RAG_TOPK**: Retrieval top-k (default 12) - **구현됨 / Implemented**
- ✅ **RERANK_TOPN**: Rerank top-n (default 5) - **구현됨 / Implemented**
- 🔄 **SCORE_THRESHOLD**: Optional min score cutoff for context - **구현 예정 / To be implemented**

Optional ideas (not required to run):
- 🔄 **MODEL_ROUTE_TABLE**: JSON map for intent-based model routing - **구현 예정 / To be implemented**
- 🔄 Auth headers/tokens for upstreams; rate limits; circuit breaker toggles - **구현 예정 / To be implemented**

## n8n workflow
Import the single JSON file `workflows/rag-prepare-upsert.json` into n8n and publish it.

This workflow exposes two endpoints:

1) POST `/webhook/rag/prepare`
	 - Input: `{ query, session_id?, thread_id?, topk?, topn? }`
	 - Performs: TEI embed → Qdrant search → TEI rerank → returns minimal context
	 - Output (example):
		 ```json
		 {
			 "context": [
				 { "id": "doc-1", "text": "...chunk text...", "score": 0.81 },
				 { "id": "doc-7", "text": "...", "score": 0.75 }
			 ],
			 "docRefs": [ { "id": "doc-1", "score": 0.81 }, { "id": "doc-7", "score": 0.75 } ]
		 }
		 ```

2) POST `/webhook/rag/upsert`
	 - Input: `{ session_id?, thread_id?, question, answer, refs: [{id,score}] }`
	 - Performs: embed new content → upsert into vector DB → returns summary/status

Tip: Register n8n Credentials for Qdrant and TEI; use them from HTTP Request nodes.

## Deploy
### Option A — Portainer Stack (recommended)
- Point Portainer to this repository and select `compose/portainer-stack.yml`.
- Set env vars (OLLAMA_URL, N8N_PREPARE_URL, N8N_UPSERT_URL, etc.) in the stack UI.
- Deploy; the app will expose port 11434 by default.

### Option B — Docker Compose
- Use `compose/docker-compose.yml` to run locally or on an edge node.
- Ensure the environment values match your upstream services (Ollama/n8n/Qdrant/TEI).

## Local development (app) - 현재 개발 환경 / Current Development Environment
- Node.js 20+ ✅ **지원됨 / Supported**
- TypeScript ✅ **완전 설정됨 / Fully configured**
- Install and run:
	```powershell
	cd app
	npm ci              # 의존성 설치 / Install dependencies
	npm run build       # TypeScript 컴파일 / Compile TypeScript ✅
	npm run start       # 프로덕션 실행 / Production start ✅
	npm run start:ts    # 개발 실행 / Development start ✅
	npm run dev         # Watch 모드 / Watch mode ✅
	```
- The server listens on `GATEWAY_BIND_PORT` (11434 by default). ✅ **작동 확인됨 / Verified working**

## API (app)
POST `/api/chat`
- Request: Ollama-compatible `{ model, messages[], stream=true, options?, session_id?, thread_id? }`
- Behavior: Streams NDJSON lines identical to Ollama’s `/api/chat`. Adds a system message and, if available, a context block from n8n.

POST `/api/embeddings`
- Behavior: Pass-through proxy to `OLLAMA_URL/api/embeddings`.

## Quick test
After deployment, replace your client’s Ollama base URL with the app URL (port 11434). Or test with curl from PowerShell:

```powershell
curl.exe http://localhost:11434/api/chat -H "Content-Type: application/json" -d '{
	"model": "qwen2:7b",
	"messages": [ { "role": "user", "content": "Share the latest install guide for Product A" } ],
	"stream": true
}'
```

You should receive streaming NDJSON, the same format as native Ollama.

## Operations tips
- Streaming always handled by the app; n8n stays synchronous (JSON in/out).
- Fallback fast: if TEI/Qdrant fails, gateway continues without RAG context.
- Trim context blocks (budgeting) and prefer safety filters against prompt injection.
- Log stage timings, doc IDs, scores, and final lengths for observability.
- Keep-Alive and compression for external TEI/Qdrant endpoints to reduce latency.

## CI/CD ✅ 구현 완료 / Implemented
Complete automated build and publish pipeline using GitHub Actions:
- **Triggers**: Push to `main`/`develop` branches, tags (`v*`), and pull requests
- **Testing**: TypeScript compilation and build verification
- **Multi-platform builds**: Supports `linux/amd64` and `linux/arm64`
- **GHCR Publishing**: Automatic container image publishing to `ghcr.io/<owner>/ollama-rag-app`
- **Security Scanning**: Trivy vulnerability scanning integration
- **Auto-tagging**: Semantic versioning, branch names, commit SHA, and `latest` tags

### Available Images / 사용 가능한 이미지
```bash
# 최신 이미지 가져오기 / Pull latest image
docker pull ghcr.io/bear8203/ollama-rag-app:latest

# 특정 버전 / Specific version
docker pull ghcr.io/bear8203/ollama-rag-app:v1.0.0
```

## 🛠️ Development Scripts / 개발 스크립트

```powershell
# 프로젝트 설정 / Project Setup
cd app
npm ci                    # 의존성 설치 / Install dependencies

# 개발 모드 / Development Mode  
npm run dev              # TypeScript watch 모드 / TypeScript watch mode
npm run start:ts         # TypeScript 직접 실행 / Direct TypeScript execution

# 프로덕션 빌드 / Production Build
npm run build            # TypeScript → JavaScript 컴파일 / Compile TypeScript to JavaScript
npm run start            # 컴파일된 JavaScript 실행 / Run compiled JavaScript

# 타입 체크 / Type Checking
npx tsc --noEmit         # 타입 에러만 체크 / Check types only
```

## Roadmap ideas (short list)
- Query→context cache (short TTL) + embedding LRU cache to reduce latency
- Dynamic top-k/top-n based on query features and rerank score distribution
- Conversation windows + vector recall of relevant past turns
- Trust/freshness-weighted rerank and multilingual RAG (translate query-only)
- Simple model routing via `MODEL_ROUTE_TABLE`

---

## 🤝 Contributors / 기여자

Thanks to all the people who have contributed to this project! / 이 프로젝트에 기여해주신 모든 분들께 감사드립니다!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

**Want to contribute?** / **기여하고 싶으신가요?**
- 🐛 Report bugs / 버그 리포트
- 💡 Suggest features / 기능 제안  
- 📖 Improve documentation / 문서 개선
- 🔧 Submit code / 코드 기여
- 🌐 Translate / 번역 작업

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

### How to add contributors automatically / 자동 기여자 추가 방법

이 프로젝트는 [All Contributors Bot](https://allcontributors.org/)을 사용하여 기여자 문서화를 자동으로 관리하고 있습니다:

1. **Bot 설치**: [All Contributors App](https://github.com/apps/allcontributors) GitHub App 설치
2. **기여자 추가**: 댓글로 `@all-contributors please add @username for code`
3. **자동 업데이트**: Bot이 자동으로 README와 `.all-contributorsrc` 파일 업데이트

**기여 유형 / Contribution Types:**
- `code` - 코드 기여
- `doc` - 문서 기여  
- `design` - 디자인 기여
- `test` - 테스트 기여
- `bug` - 버그 리포트
- `ideas` - 아이디어 제안
- `review` - 코드 리뷰

---

Completion summary
- App streams JSONL and delegates RAG orchestration to n8n
- Paths and filenames match this repo (`compose/portainer-stack.yml`, `workflows/rag-*.json`)
- Includes deployment, configuration, API contract, and a PowerShell-friendly test
