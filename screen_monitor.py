import tkinter as tk
import mss
from PIL import Image
import os
from datetime import datetime
import time

class ScreenMonitor:
    def __init__(self):
        self.monitor_area = {"top": 100, "left": 100, "width": 400, "height": 600}
        self.save_dir = "captured_images"
        self.root = None
        self.drag_data = {"x": 0, "y": 0}
        
        # 저장 디렉토리 생성
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
    
    def start_drag(self, event):
        """드래그 시작"""
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y
    
    def do_drag(self, event):
        """드래그 중"""
        dx = event.x - self.drag_data["x"]
        dy = event.y - self.drag_data["y"]
        x = self.root.winfo_x() + dx
        y = self.root.winfo_y() + dy
        self.root.geometry(f"+{x}+{y}")
    
    def get_current_position(self):
        """현재 창의 위치 반환"""
        self.root.update_idletasks()    # 처리하지 못한 명령 바로 처리하는 메서드
        x = self.root.winfo_x()
        y = self.root.winfo_y()
        return {"top": y, "left": x, 
                "width": self.monitor_area['width'],
                "height": self.monitor_area['height']}
    
    def create_overlay(self):
        """투명한 오버레이 창을 생성하여 모니터링 영역을 표시"""
        self.root = tk.Tk()
        self.root.title("Screen Monitor")
        self.root.attributes('-topmost', True)
        self.root.attributes('-alpha', 0.4)
        
        # 모니터링 영역 위치와 크기 설정
        geometry = f"{self.monitor_area['width']}x{self.monitor_area['height']}+{self.monitor_area['left']}+{self.monitor_area['top']}"
        self.root.geometry(geometry)
        
        # 파란색 테두리 프레임
        frame = tk.Frame(self.root, bg='blue', bd=5)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 내부 투명 프레임
        inner_frame = tk.Frame(frame, bg='white', bd=0)
        inner_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # 안내 텍스트
        label = tk.Label(
            inner_frame,
            text="모니터링 영역\n\n's' 키 : 스크린샷 저장\n'q' 키 : 종료",
            bg='white',
            fg='blue',
            font=('Arial', 14, 'bold'),
            justify=tk.CENTER
        )
        label.pack(expand=True)
        
        
        # 드래그 이벤트 바인딩
        frame.bind('<Button-1>', self.start_drag)
        frame.bind('<B1-Motion>', self.do_drag)
        inner_frame.bind('<Button-1>', self.start_drag)
        inner_frame.bind('<B1-Motion>', self.do_drag)
        label.bind('<Button-1>', self.start_drag)
        label.bind('<B1-Motion>', self.do_drag)
        
        # 키보드 이벤트 바인딩 (여러 방식으로 바인딩)
        self.root.bind('<KeyPress>', self.handle_key_press)

        # 포커스 설정
        self.root.focus_set()
        
        print("모니터링 영역이 표시되었습니다.")
        print("창을 드래그하여 이동하고 's' 키를 눌러 스크린샷을 저장하고, 'q' 키를 눌러 종료하세요.")
        
        return self.root
    
    def hide_window(self):
        self.root.withdraw()

    def show_window(self):
        self.root.deiconify()

    def handle_key_press(self, event):
        """키 입력 처리 (한글 포함)"""
        key = event.keysym
        char = event.char

        print(f"키 입력 : keysym={key}, char={char}")   # 디버깅용

        # 영문 's' 또는 한글 'ㄴ' (한글 자음)
        if key == 's' or char == 'ㄴ':
            self.save_screenshot()
        elif key == 'q' or char == 'ㅂ':
            self.root.quit()
        elif key == 'Escape':
            self.root.quit()
    
    def save_screenshot(self):
        """현재 모니터링 영역의 스크린샷을 저장"""
        try:
            current_area = self.get_current_position()
            
            with mss.mss() as sct:
                self.hide_window()
                screenshot = sct.grab(current_area)
                time.sleep(0.1)
                self.show_window()
                img = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
                
                # 파일명에 타임스탬프 추가
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"IMG_{timestamp}.png"
                filepath = os.path.join(self.save_dir, filename)
                
                # 이미지 저장
                img.save(filepath)
                print(f"✅ 이미지가 저장되었습니다: {filepath}")
                print(f"   위치: x={current_area['left']}, y={current_area['top']}")
                
        except Exception as e:
            print(f"❌ 이미지 저장 중 오류 발생: {e}")
    
    def start(self):
        """모니터링 시작"""
        self.create_overlay()
        self.root.mainloop()
        print("모니터링이 종료되었습니다.")

if __name__ == "__main__":
    monitor = ScreenMonitor()
    monitor.start()
