import os
import glob
import easyocr
import numpy as np
from PIL import Image
from datetime import datetime

class imgToText:
    def __init__(self):
        self.load_dir = "captured_images"
        self.save_dir = "text_msg"

        if not os.path.exists(self.load_dir):
            os.makedirs(self.load_dir)

        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

    def scanImg(self, file_path):
        """img to text"""
        reader = easyocr.Reader(['ko', 'en'])
        img = Image.open(file_path)
        result_easyocr = reader.readtext(np.array(img))
        
        extracted_texts = []
        for idx, (bbox, text, prob) in enumerate(result_easyocr): 
            print(f"텍스트 : {text} (신뢰도 : {prob:.2f})")  
            extracted_texts.append(text)
        return extracted_texts

    def get_latest_file(self):
        """최신 파일 가져오기"""
        files = glob.glob("captured_images/IMG_*.png")
        if files:
            return max(files)
        return None
    
    def save_text_to_file(self, texts, original_file_path):
        """추출된 텍스트를 파일로 저장"""
        try:
            base_name = os.path.splitext(os.path.basename(original_file_path))[0]
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{base_name}_text_{timestamp}.txt"
            file_path = os.path.join(self.save_dir, filename)

            # 텍스를 하나의 문자열로 결합
            combined_text = "\n".join(texts)

            # UTF-8 인코딩 + 파일 저장
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(combined_text)

            print(f"✅ 텍스트 파일 저장 완료: {file_path}")
            print(f"   저장된 텍스트 라인 수: {len(texts)}")
            return file_path

        except Exception as e:
            print(f"텍스트 파일 저장 실패 : {e}")
            return None

    def start(self):
        """텍스트 가져오기 시작"""
        file = self.get_latest_file()
        if file:
            print(f"읽는 파일 : {file}")
            extracted_texts = self.scanImg(file)
            if extracted_texts:
                self.save_text_to_file(extracted_texts, file)
            else:
                print("이미지 파일이 없습니다")
        else:
            print("이미지 파일이 없습니다")

