import os
import uuid
import mimetypes
from supabase import create_client, Client

# --- تنظیمات اتصال ---
url: str = "https://hwzowjniahrqdzpnlpas.supabase.co"
key: str = "sb_secret_hBTPTJiTIj4EBr2LmBCWUA_tHG5QLQ6"

supabase: Client = create_client(url, key)
bucket_name = "media"

# --- لیست فایل‌های گل و گیاه شما ---
files_to_upload = [
    r"C:\Users\Bahador\Desktop\سبد گل K87.webp",
    r"C:\Users\Bahador\Desktop\سبد گل K153.jpg",
    r"C:\Users\Bahador\Desktop\تاج گل T48.webp",
    r"C:\Users\Bahador\Desktop\گلدان آپارتمانی ارکیده سفید.webp",
    r"C:\Users\Bahador\Desktop\گلدان آپارتمانی زاموفیلیا.webp",
    r"C:\Users\Bahador\Desktop\گلدان آپارتمانی ارکیده بنفش.webp",
    r"C:\Users\Bahador\Desktop\گلدان آپارتمانی دیفن باخیا.webp",
    r"C:\Users\Bahador\Desktop\گل ‌ترحیم F72.webp",
    r"C:\Users\Bahador\Desktop\گل ترحیم F43.webp",
    r"C:\Users\Bahador\Desktop\سبد گل K151.jpg"
]

print("--- شروع آپلود محصولات گل و گیاه با تغییر نام خودکار ---\n")

for file_path in files_to_upload:
    if os.path.exists(file_path):
        original_name = os.path.basename(file_path)
        _, ext = os.path.splitext(original_name)
        
        # ساخت نام انگلیسی رندوم با پیشوند flower برای نظم بیشتر
        random_name = f"flower_{uuid.uuid4().hex[:8]}{ext}"
        
        # تشخیص نوع فایل
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            if ext.lower() == '.webp':
                mime_type = "image/webp"
            else:
                mime_type = "image/jpeg"

        print(f"🔄 در حال آپلود: {original_name} ...")
        
        try:
            with open(file_path, 'rb') as f:
                supabase.storage.from_(bucket_name).upload(
                    path=random_name, 
                    file=f, 
                    file_options={"content-type": mime_type, "upsert": "true"}
                )
            
            # دریافت لینک عمومی
            public_url = supabase.storage.from_(bucket_name).get_public_url(random_name)
            
            print(f"✅ محصول: {original_name}")
            print(f"🔗 لینک جدید: {public_url}")
            print("-" * 30)
            
        except Exception as e:
            print(f"❌ خطا در آپلود {original_name}: {e}")
            print("-" * 30)
    else:
        print(f"⚠️ فایل پیدا نشد: {file_path}")

print("\n--- پایان عملیات آپلود ---")