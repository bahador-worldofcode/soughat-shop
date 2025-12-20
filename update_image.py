import os
import uuid
import mimetypes
from supabase import create_client, Client

# --- تنظیمات اتصال ---
url: str = "https://hwzowjniahrqdzpnlpas.supabase.co"
key: str = "sb_secret_hBTPTJiTIj4EBr2LmBCWUA_tHG5QLQ6"

supabase: Client = create_client(url, key)
bucket_name = "media"

# --- اطلاعات محصول و فایل جدید ---
file_path = r"C:\Users\Bahador\Desktop\nafis-negin-pack-open-new.webp"
product_slug = "mojtahedi-exquisite-saffron-pack-40g" # اسلاگ محصول اول که ساختیم

print(f"--- شروع عملیات تعویض عکس برای محصول: {product_slug} ---\n")

if os.path.exists(file_path):
    # 1. آماده‌سازی نام فایل جدید
    original_name = os.path.basename(file_path)
    _, ext = os.path.splitext(original_name)
    random_name = f"img_HQ_{uuid.uuid4().hex[:8]}{ext}" # اسم با پیشوند HQ (High Quality)
    mime_type, _ = mimetypes.guess_type(file_path)
    
    try:
        # 2. آپلود عکس جدید
        print(f"🔄 در حال آپلود عکس باکیفیت: {original_name} ...")
        with open(file_path, 'rb') as f:
            supabase.storage.from_(bucket_name).upload(
                path=random_name, 
                file=f, 
                file_options={"content-type": mime_type if mime_type else "image/webp", "upsert": "true"}
            )
        
        # گرفتن لینک عمومی
        new_public_url = supabase.storage.from_(bucket_name).get_public_url(random_name)
        print(f"✅ آپلود شد. لینک جدید: {new_public_url}")
        
        # 3. آپدیت کردن دیتابیس (جایگزینی لینک)
        print("🔄 در حال آپدیت دیتابیس...")
        data, count = supabase.table("products").update({"image": new_public_url}).eq("slug", product_slug).execute()
        
        print("\n🎉 تبریک! عملیات با موفقیت انجام شد.")
        print(f"✅ عکس محصول '{product_slug}' در دیتابیس تغییر کرد.")
        
    except Exception as e:
        print(f"\n❌ خطا در اجرا: {e}")

else:
    print(f"❌ فایل پیدا نشد: {file_path}")
    print("لطفا مطمئن شو که فایل عکس دقیقا در آدرس بالا موجود است.")

print("\n--- پایان ---")