# 🌹 iRoseCon - 상담센터 플랫폼

> 안전하고 익명의 상담 공간에서 전문가와 소통하세요. 모든 대화는 암호화되어 보호됩니다.

## 🌐 라이브 데모

- **웹사이트**: https://www.irosecon.com
- **API 서버**: https://api.irosecon.com
- **관리자 콘솔**: https://www.irosecon.com/admin

## ✨ 주요 기능

### 🔒 보안 및 프라이버시
- **완전한 익명성**: 개인정보 없이 안전하게 상담
- **암호화 통신**: 모든 대화는 암호화되어 전송
- **자동 데이터 삭제**: 세션 종료 시 모든 데이터 즉시 삭제
- **SSL 보안**: HTTPS 암호화 통신

### 💬 실시간 상담
- **실시간 채팅**: 전문가와 즉시 소통
- **룸 관리**: 자동 또는 수동 룸 생성/참여
- **세션 관리**: 15분 기본 세션, 필요시 연장 가능
- **파일 공유**: 이미지 및 문서 업로드 지원

### 👨‍💼 관리자 기능
- **실시간 모니터링**: 시스템 상태 실시간 확인
- **활동 로그**: 모든 활동 기록 및 추적
- **사용자 관리**: 참여자 현황 모니터링
- **서버 관리**: API 서버 상태 관리

### 🌍 글로벌 접속
- **전 세계 접속**: 어디서나 인터넷으로 접속 가능
- **도메인 연결**: 전문적인 웹사이트 주소
- **모바일 지원**: 반응형 디자인으로 모든 기기 지원
- **SEO 최적화**: 검색엔진 최적화 완료

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/irosecon.git
cd irosecon
```

### 2. 의존성 설치
```bash
# API 서버 의존성
cd apps/api
npm install

# 웹 앱 의존성
cd ../web
npm install

# 관리자 콘솔 의존성
cd ../admin
npm install
```

### 3. 서버 실행
```bash
# 도메인 연결 서버 실행
cd apps/website
./domain-start.sh

# 또는 개별 실행
node api-server.js &
node web-server.js &
```

### 4. 접속
- **로컬**: http://localhost:3000
- **도메인**: https://www.irosecon.com (DNS 설정 후)

## 🏗️ 프로젝트 구조

```
irosecon/
├── apps/
│   ├── api/                 # NestJS API 서버
│   ├── web/                 # Next.js 웹 앱
│   ├── admin/               # Next.js 관리자 콘솔
│   └── website/             # 도메인 연결 웹사이트
├── packages/
│   ├── types/               # 공통 타입 정의
│   ├── crypto/              # 암호화 유틸리티
│   └── ui/                  # 공통 UI 컴포넌트
├── docs/                    # 문서
├── docker-compose.yml       # Docker 설정
└── README.md
```

## 🔧 기술 스택

### Frontend
- **Next.js 15**: React 기반 웹 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **Socket.IO**: 실시간 통신
- **Zustand**: 상태 관리

### Backend
- **NestJS**: Node.js 프레임워크
- **Express**: 웹 서버
- **Socket.IO**: 실시간 통신
- **Redis**: 세션 관리
- **S3**: 파일 저장

### Infrastructure
- **Docker**: 컨테이너화
- **Nginx**: 리버스 프록시
- **Let's Encrypt**: SSL 인증서
- **GitHub Actions**: CI/CD

## 🌐 도메인 연결

### DNS 설정
```
A 레코드: @ -> YOUR_SERVER_IP
CNAME: www -> irosecon.com
A 레코드: api -> YOUR_SERVER_IP
```

### SSL 인증서
```bash
sudo certbot --nginx -d irosecon.com -d www.irosecon.com -d api.irosecon.com
```

자세한 설정 방법은 [DOMAIN_SETUP_GUIDE.md](apps/website/DOMAIN_SETUP_GUIDE.md)를 참조하세요.

## 📱 사용 방법

### 사용자
1. **웹사이트 접속**: https://www.irosecon.com
2. **닉네임 입력** 및 **룸 ID 입력** (선택사항)
3. **상담 시작하기** 버튼 클릭
4. **실시간 채팅** 시작!

### 관리자
1. **관리자 콘솔 접속**: https://www.irosecon.com/admin
2. **실시간 모니터링** 및 **시스템 상태 확인**
3. **활동 로그** 확인

## 🔒 보안 특징

- **클라이언트 측 암호화**: AES-GCM 암호화
- **키 교환**: X25519 키 교환
- **세션 기반**: Redis TTL로 자동 만료
- **데이터 보호**: 세션 종료 시 즉시 삭제
- **감독 모드**: 관리자 모니터링 지원

## 📊 API 문서

### 주요 엔드포인트

#### 룸 관리
- `POST /rooms` - 새 룸 생성
- `GET /rooms/:id` - 룸 정보 조회
- `POST /rooms/:id/join` - 룸 참여

#### 메시지
- `POST /rooms/:id/messages` - 메시지 전송
- `GET /rooms/:id/messages` - 메시지 조회

#### 파일
- `POST /files/upload/sign` - 업로드 URL 생성

#### 시스템
- `GET /health` - 서버 상태 확인
- `GET /server/info` - 서버 정보

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- **이메일**: support@irosecon.com
- **문서**: [GitHub Wiki](https://github.com/yourusername/irosecon/wiki)
- **이슈**: [GitHub Issues](https://github.com/yourusername/irosecon/issues)

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 웹 프레임워크
- [NestJS](https://nestjs.com/) - Node.js 프레임워크
- [Socket.IO](https://socket.io/) - 실시간 통신
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크

---

**iRoseCon v1.0.0** - 안전한 상담 공간을 위한 플랫폼

[![GitHub stars](https://img.shields.io/github/stars/yourusername/irosecon?style=social)](https://github.com/yourusername/irosecon)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/irosecon?style=social)](https://github.com/yourusername/irosecon)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/irosecon)](https://github.com/yourusername/irosecon/issues)
[![GitHub license](https://img.shields.io/github/license/yourusername/irosecon)](https://github.com/yourusername/irosecon/blob/main/LICENSE)
# Irosecon
