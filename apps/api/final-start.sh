#!/bin/bash

echo "🚀 상담센터 플랫폼 최종 실행"
echo "================================"

# API 서버 실행
echo "📡 API 서버 시작 중..."
cd apps/api
node simple-server.js &
API_PID=$!
echo "✅ API 서버 시작됨 (PID: $API_PID)"
cd ../..

# 웹 앱 실행
echo "🌐 웹 앱 시작 중..."
cd apps/web
npm run dev &
WEB_PID=$!
echo "✅ 웹 앱 시작됨 (PID: $WEB_PID)"
cd ../..

# 관리자 콘솔 실행
echo "👨‍💼 관리자 콘솔 시작 중..."
cd apps/admin
npm run dev &
ADMIN_PID=$!
echo "✅ 관리자 콘솔 시작됨 (PID: $ADMIN_PID)"
cd ../..

# 잠시 대기
sleep 5

echo ""
echo "🎉 모든 서비스가 실행되었습니다!"
echo "================================"
echo ""
echo "📱 접속 주소:"
echo "   웹 앱:        http://localhost:3000"
echo "   관리자 콘솔:  http://localhost:3002"
echo "   API 서버:     http://localhost:3001"
echo ""
echo "🛑 서비스 중지하려면 Ctrl+C를 누르세요"

# 종료 처리
cleanup() {
    echo ""
    echo "🛑 서비스 중지 중..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    echo "✅ 모든 서비스가 중지되었습니다."
    exit 0
}

trap cleanup SIGINT SIGTERM

# 대기
wait
