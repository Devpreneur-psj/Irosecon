# 🌐 iRoseCon 도메인 연결 가이드

## 📋 도메인 설정 단계

### 1. DNS 설정

#### A 레코드 설정
```
Type: A
Name: @
Value: 223.39.246.133
TTL: 300 (5분)
```

#### CNAME 레코드 설정
```
Type: CNAME
Name: www
Value: irosecon.com
TTL: 300 (5분)
```

#### API 서브도메인 설정
```
Type: A
Name: api
Value: 223.39.246.133
TTL: 300 (5분)
```

### 2. SSL 인증서 설정 (Let's Encrypt)

#### Certbot 설치 및 설정
```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d irosecon.com -d www.irosecon.com -d api.irosecon.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Nginx 설정

#### /etc/nginx/sites-available/irosecon.com
```nginx
server {
    listen 80;
    server_name irosecon.com www.irosecon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name irosecon.com www.irosecon.com;

    ssl_certificate /etc/letsencrypt/live/irosecon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/irosecon.com/privkey.pem;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 보안 헤더
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 웹 서버 프록시
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.irosecon.com;

    ssl_certificate /etc/letsencrypt/live/irosecon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/irosecon.com/privkey.pem;

    # API 서버 프록시
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 서버 실행

```bash
# 도메인 연결 서버 시작
./domain-start.sh
```

## 🌍 접속 주소

### 메인 사이트
- **홈페이지**: https://www.irosecon.com
- **상담 페이지**: https://www.irosecon.com/counseling
- **관리자 페이지**: https://www.irosecon.com/admin

### API 서버
- **API 엔드포인트**: https://api.irosecon.com
- **상태 확인**: https://api.irosecon.com/health
- **서버 정보**: https://api.irosecon.com/server/info

## 🔧 기술 스택

- **웹 서버**: Node.js + Express
- **API 서버**: Node.js + Express
- **프록시**: Nginx
- **SSL**: Let's Encrypt
- **도메인**: irosecon.com

## 📱 주요 기능

- ✅ **전문적인 웹사이트**: 완전한 홈페이지 디자인
- ✅ **도메인 연결**: https://www.irosecon.com으로 접속
- ✅ **SSL 보안**: HTTPS 암호화 통신
- ✅ **SEO 최적화**: 검색엔진 최적화 완료
- ✅ **모바일 지원**: 반응형 디자인
- ✅ **실시간 채팅**: API 기반 채팅 시스템
- ✅ **관리자 콘솔**: 실시간 모니터링

## 🚀 배포 후 확인사항

1. **DNS 전파 확인**: https://dnschecker.org
2. **SSL 인증서 확인**: https://www.ssllabs.com/ssltest/
3. **웹사이트 접속 테스트**: https://www.irosecon.com
4. **API 서버 테스트**: https://api.irosecon.com/health
5. **모바일 접속 테스트**: 모바일 브라우저에서 접속

## 📞 지원

도메인 연결 과정에서 문제가 발생하면:
1. DNS 설정 확인
2. SSL 인증서 상태 확인
3. Nginx 설정 확인
4. 서버 로그 확인

---
**iRoseCon v1.0.0 - 도메인 연결 버전**
