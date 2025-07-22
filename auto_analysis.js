import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function triggerClaudeAnalysis() {
  try {
    // 1단계 : 클로드 앱 활성화
    await execAsync(`osascript -e 'tell application "Claude" to activate'`);

    // 2단계 : 텍스트 입력(시뮬레이션)
    const analysisPrompt = `
            Supabase MCP 도구를 사용해서 
            1. chat_messages에서 analyzed=false 조회
            2. 그 중에 제일 최신 파일 하나만 선택
            3. 각 메시지 감정/키워드/내용 분석
            4. 결과 저장 및 analyzed=true 업데이트
        `;

    // 클립보드에 텍스트 복사 (더 안전한 방식)
    const escapedPrompt = analysisPrompt
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ");
    await execAsync(`printf "%s" "${escapedPrompt}" | pbcopy`);
    console.log(`"${escapedPrompt}" 복사 완료`);

    // 클립보드 복사 확인을 위한 짧은 대기
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3단계 : 키보드 이벤트 시뮬레이션
    await execAsync(`osascript -e '
            tell application "Claude"
                activate
                delay 1
                tell application "System Events"
                    -- 입력 필드 클릭 (필요시)
                    click at {541, 374}
                    delay 0.5
                    -- 붙여넣기
                    keystroke "v" using command down
                    delay 1
                    -- 엔터
                    key code 36
                end tell
            end tell
            '`);

    console.log(`"${escapedPrompt}" 붙여넣기 완료`);
    console.log("분석 요청 전송됨");
  } catch (error) {
    console.error("오류 : ", error);
  }
}

setInterval(triggerClaudeAnalysis, 30000);
