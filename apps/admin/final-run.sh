#!/bin/bash

echo "🚀 상담센터 플랫폼 최종 실행"

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

echo "환경 변수 설정 완료"
echo ""

# API 서버 실행
echo "API 서버 실행 중... (포트 3001)"
cd apps/api
npm install
npm run start:dev &
API_PID=$!
cd ../..

sleep 3

# 웹 앱 실행
echo "웹 앱 실행 중... (포트 3000)"
cd apps/web
npm install
npm run dev &
WEB_PID=$!
cd ../..

sleep 3

# 관리자 콘솔 실행
echo "관리자 콘솔 실행 중... (포트 3002)"
cd apps/admin
npm install
npm run dev &
ADMIN_PID=$!
cd ../..

sleep 5

echo ""
echo "🎉 상담센터 플랫폼이 실행되었습니다!"
echo ""
echo "📱 접속 주소:"
echo "   웹 앱:        http://localhost:3000"
echo "   관리자 콘솔:  http://localhost:3002"
echo "   API 서버:     http://localhost:3001"
echo ""
echo "🛑 서비스 중지하려면 Ctrl+C를 누르세요"
echo ""

# 프로세스 정리 함수
cleanup() {
    echo ""
    echo "서비스 중지 중..."
    kill $API_PID $WEB_PID $ADMIN_PID 2>/dev/null
    echo "모든 서비스가 중지되었습니다"
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 대기
wait
