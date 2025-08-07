from screen_monitor import ScreenMonitor
from imgToText import imgToText

def main():
    print("1. 스크린 모니터 시작...")
    monitor = ScreenMonitor()
    monitor.start()
    
    print("완료!")

if __name__ == "__main__":
    main()