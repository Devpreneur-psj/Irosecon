#!/bin/bash

# 상담센터 플랫폼 실행 스크립트
echo "🚀 상담센터 플랫폼 실행 중..."

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

# 1. 필수 도구 확인
print_status "필수 도구 확인 중..."

# Node.js 확인
if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되지 않았습니다. https://nodejs.org 에서 설치하세요."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js 20 이상이 필요합니다. 현재 버전: $(node --version)"
    exit 1
fi

# pnpm 확인 및 설치
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm이 설치되지 않았습니다. 설치 중..."
    npm install -g pnpm
fi

# Redis 확인
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis가 설치되지 않았습니다."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "macOS에서 Redis 설치 중..."
        if command -v brew &> /dev/null; then
            brew install redis
        else
            print_error "Homebrew가 설치되지 않았습니다. Redis를 수동으로 설치하세요."
            exit 1
        fi
    else
        print_error "Redis를 수동으로 설치하세요."
        exit 1
    fi
fi

print_success "필수 도구 확인 완료"

# 2. Redis 실행
print_status "Redis 서버 시작 중..."
if ! pgrep -x "redis-server" > /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    else
        redis-server --daemonize yes
    fi
    sleep 2
fi

# Redis 연결 테스트
if redis-cli ping > /dev/null 2>&1; then
    print_success "Redis 서버 실행 중"
else
    print_error "Redis 서버 연결 실패"
    exit 1
fi

# 3. 의존성 설치
print_status "의존성 설치 중..."
if [ ! -d "node_modules" ]; then
    pnpm install
    if [ $? -ne 0 ]; then
        print_error "의존성 설치 실패"
        exit 1
    fi
fi

print_success "의존성 설치 완료"

# 4. 환경 변수 설정
print_status "환경 변수 설정 중..."
if [ ! -f ".env" ]; then
    cp env.sample .env
    
    # 기본 개발용 환경 변수 설정
    cat > .env << EOF
PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
JWT_SECRET=dev-secret-key-$(date +%s)
JWT_EXPIRES_IN=1h
ADMIN_PUBLIC_KEY=dev-admin-public-key
ADMIN_PRIVATE_KEY=dev-admin-private-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    
    print_success "환경 변수 파일 생성 완료"
else
    print_status "환경 변수 파일이 이미 존재합니다"
fi

# 5. 웹 앱 환경 변수 설정
print_status "웹 앱 환경 변수 설정 중..."
mkdir -p apps/web
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=상담센터
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

# 관리자 콘솔 환경 변수 설정
mkdir -p apps/admin
cat > apps/admin/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_MODE=true
NEXT_PUBLIC_APP_NAME=관리자 콘솔
EOF

print_success "환경 변수 설정 완료"

# 6. 빌드 (필요한 경우)
print_status "패키지 빌드 중..."
pnpm build --filter @counseling/types
pnpm build --filter @counseling/crypto
pnpm build --filter @counseling/ui

print_success "빌드 완료"

# 7. 서비스 실행
print_status "서비스 실행 중..."

# 백그라운드에서 API 서버 실행
print_status "API 서버 시작 중... (포트 3001)"
pnpm --filter @counseling/api dev &
API_PID=$!

# 잠시 대기
sleep 3

# 백그라운드에서 웹 앱 실행
print_status "웹 앱 시작 중... (포트 3000)"
pnpm --filter @counseling/web dev &
WEB_PID=$!

# 잠시 대기
sleep 3

# 백그라운드에서 관리자 콘솔 실행
print_status "관리자 콘솔 시작 중... (포트 3002)"
pnpm --filter @counseling/admin dev &
ADMIN_PID=$!

# 잠시 대기
sleep 5

# 8. 서비스 상태 확인
print_status "서비스 상태 확인 중..."

# API 서버 확인
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "API 서버 실행 중 (http://localhost:3001)"
else
    print_warning "API 서버 연결 확인 실패"
fi

# 웹 앱 확인
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "웹 앱 실행 중 (http://localhost:3000)"
else
    print_warning "웹 앱 연결 확인 실패"
fi

# 관리자 콘솔 확인
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    print_success "관리자 콘솔 실행 중 (http://localhost:3002)"
else
    print_warning "관리자 콘솔 연결 확인 실패"
fi

# 9. 완료 메시지
echo ""
echo "🎉 상담센터 플랫폼이 성공적으로 실행되었습니다!"
echo ""
echo "📱 접속 주소:"
echo "   웹 앱:        http://localhost:3000"
echo "   관리자 콘솔:  http://localhost:3002"
echo "   API 서버:     http://localhost:3001"
echo ""
echo "🛑 서비스 중지하려면 Ctrl+C를 누르세요"
echo ""

# 10. 프로세스 정리 함수
cleanup() {
    echo ""
    print_status "서비스 중지 중..."
    kill $API_PID $WEB_PID $ADMIN_PID 2>/dev/null
    print_success "모든 서비스가 중지되었습니다"
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 11. 로그 모니터링
print_status "로그 모니터링 중... (Ctrl+C로 중지)"
echo ""

# 실시간 로그 표시 (간단한 버전)
tail -f /dev/null &
wait
