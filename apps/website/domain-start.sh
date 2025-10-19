#!/bin/bash

echo "🌐 iRoseCon 도메인 연결 서버 시작"
echo "=================================="

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
print_status "iRoseCon API 서버 시작 중..."
if [ -f "api-server.js" ]; then
    node api-server.js &
    API_PID=$!
    print_success "API 서버 시작됨 (PID: $API_PID)"
else
    print_error "api-server.js 파일을 찾을 수 없습니다."
    exit 1
fi

# 잠시 대기
sleep 2

# 웹 서버 실행
print_status "iRoseCon 웹 서버 시작 중..."
if [ -f "web-server.js" ]; then
    node web-server.js &
    WEB_PID=$!
    print_success "웹 서버 시작됨 (PID: $WEB_PID)"
else
    print_error "web-server.js 파일을 찾을 수 없습니다."
    exit 1
fi

# 잠시 대기
sleep 3

echo ""
echo "🎉 iRoseCon 도메인 연결 서버가 실행되었습니다!"
echo "=================================="
echo ""
echo "🌍 도메인 접속 주소:"
echo "   메인 사이트:     https://www.irosecon.com"
echo "   상담 페이지:     https://www.irosecon.com/counseling"
echo "   관리자 페이지:   https://www.irosecon.com/admin"
echo "   API 서버:        https://api.irosecon.com"
echo ""
echo "🔧 서비스 상태:"
echo "   API 서버:        PID $API_PID"
echo "   웹 서버:         PID $WEB_PID"
echo ""
echo "📱 도메인 연결 설정:"
echo "   A 레코드:        $PUBLIC_IP"
echo "   CNAME:           api.irosecon.com -> $PUBLIC_IP"
echo "   SSL 인증서:      Let's Encrypt 권장"
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
