#!/bin/bash

echo "🚀 상담센터 플랫폼 완전 실행"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 설정
export PORT=3001
export CORS_ORIGIN="http://localhost:3000,http://localhost:3002"

# 프로세스 ID 저장
API_PID=""
WEB_PID=""
ADMIN_PID=""

# 종료 처리 함수
cleanup() {
    echo ""
    print_status "서비스 중지 중..."
    
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
        print_success "API 서버 중지됨"
    fi
    
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null
        print_success "웹 앱 중지됨"
    fi
    
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null
        print_success "관리자 콘솔 중지됨"
    fi
    
    print_success "모든 서비스가 중지되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# API 서버 실행
print_status "API 서버 시작 중..."
cd apps/api
if [ -f "simple-server.js" ]; then
    node simple-server.js &
    API_PID=$!
    print_success "API 서버 시작됨 (PID: $API_PID)"
else
    print_error "simple-server.js 파일을 찾을 수 없습니다."
    exit 1
fi
cd ../..

# 잠시 대기
sleep 2

# 웹 앱 실행
print_status "웹 앱 시작 중..."
cd apps/web
if [ -f "package.json" ]; then
    npm run dev &
    WEB_PID=$!
    print_success "웹 앱 시작됨 (PID: $WEB_PID)"
else
    print_error "웹 앱 package.json을 찾을 수 없습니다."
    exit 1
fi
cd ../..

# 잠시 대기
sleep 2

# 관리자 콘솔 실행
print_status "관리자 콘솔 시작 중..."
cd apps/admin
if [ -f "package.json" ]; then
    npm run dev &
    ADMIN_PID=$!
    print_success "관리자 콘솔 시작됨 (PID: $ADMIN_PID)"
else
    print_error "관리자 콘솔 package.json을 찾을 수 없습니다."
    exit 1
fi
cd ../..

# 잠시 대기
sleep 3

echo ""
echo "🎉 모든 서비스가 실행되었습니다!"
echo "================================"
echo ""
echo "📱 접속 주소:"
echo "   웹 앱:        http://localhost:3000"
echo "   관리자 콘솔:  http://localhost:3002"
echo "   API 서버:     http://localhost:3001"
echo ""
echo "🔧 서비스 상태:"
echo "   API 서버:     PID $API_PID"
echo "   웹 앱:        PID $WEB_PID"
echo "   관리자 콘솔:  PID $ADMIN_PID"
echo ""
echo "🛑 서비스 중지하려면 Ctrl+C를 누르세요"
echo ""

# 서비스 상태 모니터링
while true; do
    # API 서버 상태 확인
    if ! kill -0 $API_PID 2>/dev/null; then
        print_error "API 서버가 중지되었습니다."
        cleanup
    fi
    
    # 웹 앱 상태 확인
    if ! kill -0 $WEB_PID 2>/dev/null; then
        print_error "웹 앱이 중지되었습니다."
        cleanup
    fi
    
    # 관리자 콘솔 상태 확인
    if ! kill -0 $ADMIN_PID 2>/dev/null; then
        print_error "관리자 콘솔이 중지되었습니다."
        cleanup
    fi
    
    sleep 5
done
