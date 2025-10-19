#!/bin/bash

echo "🚀 상담센터 플랫폼 간단 실행"

# 환경 변수 설정
echo "PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
ADMIN_PUBLIC_KEY=dev-admin-public-key
ADMIN_PRIVATE_KEY=dev-admin-private-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3002" > .env

# 웹 앱 환경 변수
mkdir -p apps/web apps/admin
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/admin/.env.local

# 루트 의존성 설치
echo "루트 의존성 설치 중..."
pnpm install

# 패키지 빌드
echo "패키지 빌드 중..."
cd packages/types && pnpm install && pnpm build && cd ../..
cd packages/crypto && pnpm install && pnpm build && cd ../..
cd packages/ui && pnpm install && pnpm build && cd ../..

# 앱 의존성 설치
echo "앱 의존성 설치 중..."
cd apps/api && pnpm install && cd ../..
cd apps/web && pnpm install && cd ../..
cd apps/admin && pnpm install && cd ../..

# 모든 서비스 실행
echo "서비스 실행 중..."
pnpm dev
