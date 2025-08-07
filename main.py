from screen_monitor import ScreenMonitor
import subprocess
import time

def main():
    print("1. 스크린 모니터 시작...")
    monitor = ScreenMonitor()
    monitor.start()

    time.sleep(5)
    subprocess.run(["osascript", "Kakao_Assistant.scpt"])
    
    print("텍스트 추천까지 완료!")

if __name__ == "__main__":
    main()