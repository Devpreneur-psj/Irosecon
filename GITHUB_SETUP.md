# 🐙 GitHub 저장소 연결 가이드

## 1. GitHub에서 새 저장소 생성

### 웹 브라우저에서 GitHub 접속
1. https://github.com 접속
2. 로그인 후 "New repository" 클릭
3. 저장소 설정:
   - **Repository name**: `irosecon`
   - **Description**: `🌹 iRoseCon - 안전한 상담센터 플랫폼`
   - **Visibility**: Public (또는 Private)
   - **Initialize**: 체크 해제 (이미 로컬에 파일이 있음)

## 2. 로컬 저장소와 연결

### 저장소 생성 후 GitHub에서 제공하는 명령어 실행:

```bash
# 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/irosecon.git

# 메인 브랜치로 푸시
git push -u origin main
```

## 3. 저장소 설정

### GitHub 저장소 페이지에서:
1. **Settings** → **Pages** → **Source**: Deploy from a branch
2. **Branch**: main
3. **Folder**: / (root)
4. **Save** 클릭

### 저장소 정보 업데이트:
1. **About** 섹션에서:
   - **Website**: https://www.irosecon.com
   - **Description**: 🌹 iRoseCon - 안전한 상담센터 플랫폼
   - **Topics**: counseling, chat, real-time, security, privacy

## 4. 추가 설정

### README.md 업데이트
- GitHub 사용자명으로 URL 수정 필요
- `yourusername` → 실제 GitHub 사용자명으로 변경

### GitHub Actions 설정 (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to server
      run: |
        # 배포 스크립트 실행
        echo "Deploying to production server..."
```

## 5. 완료 후 확인

### 저장소 접속 주소:
- **GitHub**: https://github.com/YOUR_USERNAME/irosecon
- **웹사이트**: https://www.irosecon.com
- **API**: https://api.irosecon.com

### 주요 파일들:
- ✅ README.md - 프로젝트 소개
- ✅ .gitignore - Git 무시 파일
- ✅ package.json - 프로젝트 설정
- ✅ docker-compose.yml - Docker 설정
- ✅ apps/website/ - 도메인 연결 웹사이트
- ✅ docs/ - 프로젝트 문서

## 6. 협업 설정

### Issues 및 Discussions 활성화:
1. **Settings** → **Features**
2. **Issues** 체크
3. **Discussions** 체크 (선택사항)

### 브랜치 보호 규칙 설정:
1. **Settings** → **Branches**
2. **Add rule** 클릭
3. **Branch name pattern**: main
4. **Require pull request reviews** 체크
5. **Require status checks** 체크

## 7. 배포 설정

### Vercel 배포 (권장):
1. https://vercel.com 접속
2. GitHub 계정 연결
3. `irosecon` 저장소 선택
4. 자동 배포 설정

### Netlify 배포:
1. https://netlify.com 접속
2. GitHub 계정 연결
3. 저장소 선택 후 배포

---
**GitHub 저장소 연결 완료 후 이 가이드를 삭제하세요.**
