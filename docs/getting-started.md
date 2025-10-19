# 설치 및 실행 가이드

## 🚀 빠른 시작

### 1. 필수 요구사항
- Node.js 20+
- pnpm 8+
- Redis
- S3 호환 오브젝트 스토리지 (AWS S3, Cloudflare R2, MinIO 등)

### 2. 설치
```bash
# 저장소 클론
git clone <repository-url>
cd Secret_project

# 의존성 설치
pnpm install

# 환경 변수 설정
cp env.sample .env
# .env 파일을 편집하여 필요한 값들을 설정
```

### 3. 환경 변수 설정
```bash
# .env 파일 예시
PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=counseling-files
JWT_SECRET=your-super-secret-jwt-key
ADMIN_PUBLIC_KEY=your-admin-public-key
ADMIN_PRIVATE_KEY=your-admin-private-key
```

### 4. 개발 서버 실행
```bash
# 모든 서비스 동시 실행
pnpm dev

# 또는 개별 실행
pnpm --filter @counseling/api dev
pnpm --filter @counseling/web dev
pnpm --filter @counseling/admin dev
```

### 5. 접속
- **웹 앱**: http://localhost:3000
- **관리자 콘솔**: http://localhost:3002
- **API 서버**: http://localhost:3001

## 🐳 Docker로 실행

### 1. Docker Compose 사용
```bash
# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

### 2. 개별 Docker 이미지 빌드
```bash
# API 서버
cd apps/api
docker build -t counseling-api .

# 웹 앱
cd apps/web
docker build -t counseling-web .

# 관리자 콘솔
cd apps/admin
docker build -t counseling-admin .
```

## 🧪 테스트

### 1. 단위 테스트
```bash
# 모든 패키지 테스트
pnpm test

# 특정 패키지 테스트
pnpm --filter @counseling/crypto test
```

### 2. E2E 테스트
```bash
# E2E 테스트 실행
pnpm test:e2e
```

### 3. 타입 체크
```bash
pnpm type-check
```

## 📦 빌드

### 1. 프로덕션 빌드
```bash
# 모든 패키지 빌드
pnpm build

# 특정 패키지 빌드
pnpm --filter @counseling/web build
```

### 2. 정적 파일 생성
```bash
# 웹 앱 정적 파일 생성
cd apps/web
pnpm build
pnpm export
```

## 🚀 배포

### 1. 클라우드 배포 (예: Fly.io)
```bash
# Fly.io CLI 설치
curl -L https://fly.io/install.sh | sh

# 앱 배포
fly launch
fly deploy
```

### 2. Vercel 배포 (웹 앱)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 3. Docker 배포
```bash
# 이미지 빌드 및 푸시
docker build -t your-registry/counseling-api .
docker push your-registry/counseling-api

# 배포
docker run -d -p 3001:3001 your-registry/counseling-api
```

## 🔧 개발 도구

### 1. 코드 포맷팅
```bash
pnpm format
```

### 2. 린팅
```bash
pnpm lint
```

### 3. 의존성 업데이트
```bash
pnpm update
```

## 🐛 문제 해결

### 1. 일반적인 문제
- **포트 충돌**: 다른 포트 사용하거나 기존 프로세스 종료
- **Redis 연결 실패**: Redis 서버가 실행 중인지 확인
- **S3 연결 실패**: 환경 변수와 권한 확인

### 2. 로그 확인
```bash
# 개발 서버 로그
pnpm dev

# Docker 로그
docker-compose logs -f api
```

### 3. 디버깅
```bash
# 디버그 모드로 실행
NODE_ENV=development DEBUG=* pnpm dev
```

## 📚 추가 리소스

- [개인정보 처리방침](./docs/privacy-policy.md)
- [이용약관](./docs/terms-of-service.md)
- [보안 체크리스트](./docs/security-checklist.md)
- [API 문서](./docs/api.md)
- [아키텍처 가이드](./docs/architecture.md)
