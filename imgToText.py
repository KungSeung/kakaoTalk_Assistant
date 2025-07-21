import os
import glob
import easyocr
import numpy as np
from PIL import Image

class imgToText:
    def __init__(self):
        self.load_dir = "captured_images"

    def scanImg(self, file_path):
        """img to text"""
        reader = easyocr.Reader(['ko', 'en'])
        img = Image.open(file_path)
        result_easyocr = reader.readtext(np.array(img))
        
        for idx, (bbox, text, prob) in enumerate(result_easyocr):     # 디버깅용
            print(text)
        return result_easyocr

    def get_latest_file(self):
        files = glob.glob("captured_images/IMG_*.png")
        if files:
            return max(files)
        return None

    def start(self):
        file = self.get_latest_file()
        if file:
            print(f"읽는 파일 : {file}")
            text = self.scanImg(file)
        else:
            print("이미지 파일이 없습니다")


if __name__ == "__main__":
    scan = imgToText()
    scan.start()




