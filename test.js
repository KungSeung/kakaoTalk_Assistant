import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

async function sendToKakaoTalk() {
  const analysisPrompt = `
        Supabase MCP 도구를 사용해서
        1. chat_messages에서 analyzed=false 조회
        2. 그 중에 제일 최신 파일 하나만 선택
        3. 각 메시지 감정/키워드/내용 분석
        4. 결과 저장 및 analyzed=true 업데이트
    `;

  /// 파일이 있을 때만 클립보드 복사
  if (fs.existsSync("kakao_message_prompt.txt")) {
    fs.writeFileSync("kakao_message_prompt.txt", analysisPrompt, "utf8");
  }
  await execAsync("cat kakao_message_prompt.txt | pbcopy");

  // 복사 확인
  const clipboardContent = await execAsync(`pbpaste`);
  console.log("클립보드 내용:", clipboardContent.stdout);

  // 클립보드 복사 확인을 위한 충분한 대기
  await new Promise((resolve) => setTimeout(resolve, 500));
  //   console.log(`${escapedPrompt} 복사완료`);

  const appleScript = `
        if application "KakaoTalk" is running then
            tell application "KakaoTalk" to activate
            delay 1.5
            tell application "System Events"
                tell application process "KakaoTalk"
                    delay 1.5
                    keystroke "v" using command down
                    keystroke "hi"
                    key code 36
                end tell
            end tell
        else
            display dialog "KakaoTalk이 실행되지 않았습니다."
        end if`;

  try {
    await execAsync(`osascript -e '${appleScript}'`);
    console.log("카카오톡에 메시지 전송 완료");
  } catch (error) {
    console.error("오류 발생:", error);
  }
}

// 사용
sendToKakaoTalk();
