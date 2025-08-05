# KakaoTalk Assistant 자동 실행 설정 가이드

Mac에서 시스템 시작 시 또는 절전모드 해제 시 자동으로 KakaoTalk Assistant를 실행하는 방법입니다.

## 🔧 설치 방법

### 1단계: LaunchAgent 설치

터미널에서 다음 명령어를 실행하세요:

```bash
# plist 파일을 LaunchAgents 디렉토리로 복사
cp /Users/seung/Desktop/kakaoTalk_Assistant/com.kakaotalk.assistant.plist ~/Library/LaunchAgents/

# 권한 설정
chmod 644 ~/Library/LaunchAgents/com.kakaotalk.assistant.plist

# LaunchAgent 로드 (즉시 시작)
launchctl load ~/Library/LaunchAgents/com.kakaotalk.assistant.plist
```

### 2단계: AppleScript 권한 설정

AppleScript가 터미널 접근 권한을 갖도록 설정:

1. **시스템 설정** > **개인 정보 보호 및 보안** > **접근성** 이동
2. **스크립트 편집기** 또는 **터미널** 앱을 추가하고 체크박스 활성화
3. **자동화** 섹션에서도 필요한 권한을 허용

## 🎯 작동 방식

### 자동 실행 시점
- ✅ Mac 시스템 시작 시
- ✅ 사용자 로그인 시
- ✅ 절전모드 해제 시
- ✅ 프로세스 종료 시 자동 재시작

### 실행 과정
1. `AutoLauncher.scpt` → Python 파일 존재 확인
2. 백그라운드에서 `main.py` 실행
3. 프로세스 모니터링 (60초마다)
4. 종료 시 자동 재시작

## 📊 모니터링 및 로그

### 로그 파일 위치
- `launcher.log` - AppleScript 실행 로그
- `launcher_stdout.log` - 표준 출력 로그
- `launcher_stderr.log` - 에러 로그

### 상태 확인 명령어
```bash
# LaunchAgent 상태 확인
launchctl list | grep com.kakaotalk.assistant

# 프로세스 확인
ps aux | grep "main.py"

# 로그 실시간 확인
tail -f /Users/seung/Desktop/kakaoTalk_Assistant/launcher.log
```

## 🛠️ 관리 명령어

### 서비스 제어
```bash
# 서비스 중지
launchctl unload ~/Library/LaunchAgents/com.kakaotalk.assistant.plist

# 서비스 시작
launchctl load ~/Library/LaunchAgents/com.kakaotalk.assistant.plist

# 서비스 재시작
launchctl unload ~/Library/LaunchAgents/com.kakaotalk.assistant.plist
launchctl load ~/Library/LaunchAgents/com.kakaotalk.assistant.plist
```

### 완전 제거
```bash
# 서비스 중지 및 제거
launchctl unload ~/Library/LaunchAgents/com.kakaotalk.assistant.plist
rm ~/Library/LaunchAgents/com.kakaotalk.assistant.plist
```

## 🚨 문제 해결

### 자동 실행이 안 될 때
1. **권한 확인**: 시스템 설정에서 접근성/자동화 권한 확인
2. **경로 확인**: Python 파일과 스크립트 경로가 정확한지 확인
3. **로그 확인**: 에러 로그에서 구체적인 오류 메시지 확인

### 수동 테스트
```bash
# AppleScript 수동 실행
osascript /Users/seung/Desktop/kakaoTalk_Assistant/AutoLauncher.scpt

# Python 스크립트 직접 실행
cd /Users/seung/Desktop/kakaoTalk_Assistant
python3 main.py
```

### 일반적인 오류들
- **권한 거부**: 시스템 설정에서 접근성 권한 허용 필요
- **파일 없음**: 경로 오타 또는 파일 이동 확인
- **Python 없음**: `python3` 명령어 사용 가능 여부 확인

## 📱 알림 설정

AppleScript는 다음 상황에서 macOS 알림을 표시합니다:
- ✅ 정상 시작 시
- ❌ 파일을 찾을 수 없을 때
- ⚠️ 실행 중 오류 발생 시

## 🔄 고급 설정

### 실행 간격 조정
`AutoLauncher.scpt`의 마지막 줄에서 간격 수정:
```applescript
-- 60초마다 확인 → 30초로 변경
return 30
```

### Python 가상환경 사용
스크립트에서 가상환경 활성화하려면 shellCommand 수정:
```applescript
set shellCommand to "cd '" & projectPath & "' && source venv/bin/activate && python main.py >> '" & logFile & "' 2>&1 &"
```