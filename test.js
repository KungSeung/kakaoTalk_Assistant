import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

async function sendToKakaoTalk() {
  const analysisPrompt = `Supabase MCP 도구를 사용해서
1. chat_messages에서 analyzed=false 조회
2. 그 중에 제일 최신 파일 하나만 선택
3. 각 메시지 감정/키워드/내용 분석
4. 결과 저장 및 analyzed=true 업데이트`;

  try {
    // 1. 프롬프트 파일에 저장
    await savePromptToFile(analysisPrompt);

    // 2. 클립보드에 복사
    // await copyFileToClipboard();

    // 3. 카카오톡에 전송
    await sendDialogFile();

    console.log("✅ 카카오톡에 메시지 전송 완료");
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
  }
}

async function savePromptToFile(content) {
  const filePath = "MsgPrompt.txt";
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("📄 프롬프트 파일 저장 완료");
  }
}

async function copyFileToClipboard() {
  const filePath = path.join(process.cwd(), "MsgPrompt.txt");

  if (!fs.existsSync(filePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
  }

  // 파일을 클립보드에 복사
  //   await execAsync(`cat "MsgPrompt.txt" | base64 | pbcopy`);

  //   // 딜레이
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   // 복사 확인
  //   const clipboardContent = await execAsync("pbpaste | base64 -d");
  //   console.log("📋 클립보드 복사 완료");
  //   console.log("내용:", clipboardContent.stdout);

  const content = fs.readFileSync(filePath, "utf8");
  const base64Content = Buffer.from(content, "utf8").toString("base64");

  // 클립보드에 복사
  await execAsync(`printf "%s" "${base64Content}" | pbcopy`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("📋 UTF-8 base64 인코딩 완료");
}

async function sendToKakaoTalkApp() {
  const appleScript = `
    if application "Claude" is running then
      tell application "Claude" to activate
      delay 1.5
      tell application "System Events"
        tell application process "Claude"
          delay 1.0
          
          -- 클립보드에서 base64 문자열 가져오기
          set base64String to (the clipboard as string)
          
          -- printf를 사용해서 안전하게 디코딩
          try
            set decodedText to (do shell script "printf '%s' " & quoted form of base64String & " | base64 -d | iconv -f UTF-8 -t UTF-8")
            
            keystroke decodedText
            delay 0.5
            key code 36
            
          on error errMsg
            display dialog "디코딩 오류: " & errMsg
          end try
        end tell
      end tell
    else
      display dialog "KakaoTalk이 실행되지 않았습니다."
    end if`;

  await execAsync(`osascript -e '${appleScript}'`);
  console.log("🚀 카카오톡 전송 스크립트 실행 완료");
}

async function sendPreDecodedToKakaoTalk() {
  try {
    // JavaScript에서 안전하게 디코딩
    const clipboardResult = await execAsync("pbpaste");
    const base64String = clipboardResult.stdout.trim();
    const decodedText = Buffer.from(base64String, "base64").toString("utf8");

    console.log("✅ 디코딩 내용 : ", decodedText);
    console.log("✅ 디코딩 성공, 길이:", decodedText.length);

    // 이스케이프 처리
    const escapedText = decodedText
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    const appleScript = `
      if application "KakaoTalk" is running then
        tell application "KakaoTalk" to activate
        delay 1.5
        tell application "System Events"
          tell application process "KakaoTalk"
            delay 1.0
            keystroke "${decodedText}"
            delay 0.5
            key code 36
          end tell
        end tell
      else
        display dialog "KakaoTalk이 실행되지 않았습니다."
      end if`;

    await execAsync(`osascript -e '${appleScript}'`);
    console.log("🚀 카카오톡 전송 완료");
  } catch (error) {
    console.error("❌ 오류:", error.message);
  }
}

async function sendDialogFile() {
  try {
    // 1. 데스크톱 파일 경로
    const desktopPath = path.join(
      os.homedir(),
      "Desktop/KakaoTalk_Assistant",
      "MsgPrompt.txt"
    );

    // 2. 파일 읽기 (UTF-8)
    const content = fs.readFileSync(desktopPath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    // 3. 각 줄 전송
    for (const line of lines) {
      // 클립보드에 복사
      const escapedLine = line.replace(/"/g, '\\"');
      await execAsync(`printf "%s" "${escapedLine}" | pbcopy`);

      // 카카오톡에 전송
      const appleScript = `
        tell application "KakaoTalk" to activate
        tell application "System Events"
          keystroke "v" using command down
          keystroke "hi"
          key code 36
          delay 1.5
        end tell
      `;

      await execAsync(`osascript -e '${appleScript}'`);
      console.log(`📤 전송: ${line.substring(0, 30)}...`);
    }

    console.log("✅ 모든 줄 전송 완료");
  } catch (error) {
    console.error("❌ 오류:", error.message);
  }
}

// 실행
sendToKakaoTalk();
