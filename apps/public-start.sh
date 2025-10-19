#!/bin/bash

echo "🌍 공개 접속 가능한 상담센터 플랫폼 시작"
echo "=========================================="

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

# 공개 IP 확인
PUBLIC_IP=$(curl -s -4 ifconfig.me)
print_status "공개 IP: $PUBLIC_IP"

# 프로세스 ID 저장
API_PID=""
WEB_PID=""

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
        print_success "웹 서버 중지됨"
    fi
    
    print_success "모든 서비스가 중지되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# API 서버 실행
print_status "공개 API 서버 시작 중..."
cd apps/api
if [ -f "public-server.js" ]; then
    node public-server.js &
    API_PID=$!
    print_success "API 서버 시작됨 (PID: $API_PID)"
else
    print_error "public-server.js 파일을 찾을 수 없습니다."
    exit 1
fi
cd ../..

# 잠시 대기
sleep 2

# 웹 서버 실행
print_status "공개 웹 서버 시작 중..."
cd apps/static-demo
if [ -f "public-index.html" ]; then
    python3 -m http.server 3000 --bind 0.0.0.0 &
    WEB_PID=$!
    print_success "웹 서버 시작됨 (PID: $WEB_PID)"
else
    print_error "public-index.html 파일을 찾을 수 없습니다."
    exit 1
fi
cd ../..

# 잠시 대기
sleep 3

echo ""
echo "🎉 공개 접속 가능한 상담센터 플랫폼이 실행되었습니다!"
echo "=========================================="
echo ""
echo "🌍 공개 접속 주소:"
echo "   웹 앱:        http://$PUBLIC_IP:3000/public-index.html"
echo "   관리자 콘솔:  http://$PUBLIC_IP:3000/public-admin.html"
echo "   API 서버:     http://$PUBLIC_IP:3001"
echo ""
echo "🔧 서비스 상태:"
echo "   API 서버:     PID $API_PID"
echo "   웹 서버:      PID $WEB_PID"
echo ""
echo "📱 사용 방법:"
echo "   1. 위의 웹 앱 주소로 접속"
echo "   2. 닉네임 입력 후 상담 시작"
echo "   3. 전 세계 어디서나 접속 가능!"
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
    
    # 웹 서버 상태 확인
    if ! kill -0 $WEB_PID 2>/dev/null; then
        print_error "웹 서버가 중지되었습니다."
        cleanup
    fi
    
    sleep 5
done
