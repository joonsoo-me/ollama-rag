# === Multi-stage build for Ollama RAG Gateway ===

# Build stage / 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files / 패키지 파일 복사
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build) / 모든 의존성 설치 (빌드용 dev 의존성 포함)
RUN npm ci

# Copy source code / 소스 코드 복사
COPY src/ ./src/

# Build TypeScript / TypeScript 빌드
RUN npm run build

# Production stage / 프로덕션 스테이지
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling / 신호 처리를 위한 dumb-init 설치
RUN apk add --no-cache dumb-init

# Create non-root user / 비루트 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ollama-rag -u 1001

WORKDIR /app

# Copy package files / 패키지 파일 복사
COPY package*.json ./

# Install only production dependencies / 프로덕션 의존성만 설치
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage / 빌더 스테이지에서 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user / 비루트 사용자로 소유권 변경
RUN chown -R ollama-rag:nodejs /app
USER ollama-rag

# Health check / 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:11434/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Expose port / 포트 노출
EXPOSE 11434

# Use dumb-init for proper signal handling / 적절한 신호 처리를 위해 dumb-init 사용
ENTRYPOINT ["dumb-init", "--"]

# Start the application / 애플리케이션 시작
CMD ["node", "dist/server.js"]