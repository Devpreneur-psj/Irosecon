#!/bin/bash

echo "🚀 상담센터 플랫폼 데모 실행"
echo ""

# 환경 변수 설정
echo "PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
ADMIN_PUBLIC_KEY=dev-admin-public-key
ADMIN_PRIVATE_KEY=dev-admin-private-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3002" > .env

echo "환경 변수 설정 완료"
echo ""

echo "다음 명령어들을 각각 다른 터미널에서 실행하세요:"
echo ""
echo "1. API 서버 (터미널 1):"
echo "   cd apps/api && npm install && npm run start:dev"
echo ""
echo "2. 간단한 웹 앱 (터미널 2):"
echo "   cd simple-web && npm install && npm run dev"
echo ""
echo "📱 접속 주소:"
echo "   웹 앱:        http://localhost:3000"
echo "   API 서버:     http://localhost:3001"
echo ""
echo "각 터미널에서 Ctrl+C로 중지할 수 있습니다."
