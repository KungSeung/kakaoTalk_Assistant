-- KakaoTalk Assistant Auto Launcher
-- Mac 시작 시 또는 절전모드 해제 시 자동으로 main.py 실행

on run
	try
		-- 프로젝트 경로 설정
		set projectPath to "/Users/seung/Desktop/kakaoTalk_Assistant"
		set pythonFile to projectPath & "/main.py"
		
		-- Python 파일 존재 확인
		tell application "System Events"
			if not (exists file pythonFile) then
				display notification "Python 파일을 찾을 수 없습니다: " & pythonFile with title "KakaoTalk Assistant"
				return
			end if
		end tell
		
		-- 로그 파일 경로
		set logFile to projectPath & "/launcher.log"
		set currentTime to (current date) as string
		
		-- 터미널에서 Python 스크립트 실행
		set shellCommand to "cd '" & projectPath & "' && python3 main.py >> '" & logFile & "' 2>&1 &"
		
		-- 백그라운드에서 실행
		do shell script shellCommand
		
		-- 성공 알림
		display notification "KakaoTalk Assistant가 시작되었습니다" with title "Auto Launcher"
		
		-- 로그 기록
		set logEntry to currentTime & " - KakaoTalk Assistant 자동 시작됨" & return
		do shell script "echo '" & logEntry & "' >> '" & logFile & "'"
		
	on error errMsg
		-- 에러 발생 시 알림
		display notification "실행 중 오류 발생: " & errMsg with title "KakaoTalk Assistant"
		
		-- 에러 로그 기록
		set logFile to "/Users/seung/Desktop/kakaoTalk_Assistant/launcher.log"
		set currentTime to (current date) as string
		set errorEntry to currentTime & " - 오류: " & errMsg & return
		do shell script "echo '" & errorEntry & "' >> '" & logFile & "'"
	end try
end run

-- 시스템 이벤트 처리 (절전모드 해제 등)
on idle
	-- 주기적으로 Python 프로세스가 실행 중인지 확인하고 필요시 재시작
	try
		set processCheck to do shell script "pgrep -f 'python3.*main.py' | wc -l"
		if processCheck is "0" then
			-- Python 프로세스가 실행 중이 아니면 재시작
			run
		end if
	end try
	
	-- 60초마다 확인
	return 60
end idle