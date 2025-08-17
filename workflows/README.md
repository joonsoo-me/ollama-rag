# 📚 RAG 워크플로우 사용법 / RAG Workflow Usage Guide

## 🚀 빠른 시작 / Quick Start

### 환경 변수 설정 / Environment Variables
```bash
TEI_EMBED_URL=http://localhost:8080      # 임베딩 서버
TEI_RERANK_URL=http://localhost:8081     # 재랭킹 서버
QDRANT_URL=http://localhost:6333         # Qdrant 벡터 DB
QDRANT_COLLECTION=documents              # 컬렉션 이름
```

### 📝 API 엔드포인트 / Endpoints

#### 1. 문서 검색 (RAG Prepare)
```bash
POST /rag/prepare
{
  "query": "검색할 질문",
  "topk": 12,
  "topn": 5,
  "score_threshold": 0.2
}
```

#### 2. 답변 저장 (RAG Upsert)
```bash
POST /rag/upsert
{
  "answer": "LLM 생성 답변",
  "question": "원본 질문",
  "refs": ["참조 문서들"]
}
```

## 🔄 워크플로우 흐름 / Workflow Flow
1. 🔍 **검색**: 질문 → 임베딩 → 벡터 검색 → 재랭킹 → 컨텍스트 반환
2. 💾 **저장**: 답변 → 임베딩 → 벡터 DB 저장

## ⚙️ 주요 설정 / Key Settings
- **topk**: 벡터 검색할 문서 수 (1-64)
- **topn**: 최종 반환할 문서 수
- **score_threshold**: 최소 유사도 점수

더 자세한 내용은 workflows/README.md 참조 📖