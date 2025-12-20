import os
import mimetypes
from supabase import create_client, Client

# --- تنظیمات اتصال (اطلاعات خودت رو جایگذاری کردم) ---
url: str = "https://hwzowjniahrqdzpnlpas.supabase.co"
key: str = "sb_secret_hBTPTJiTIj4EBr2LmBCWUA_tHG5QLQ6"

supabase: Client = create_client(url, key)
bucket_name = "media"

# --- نقشه اتصال فایل به اسلاگ دیتابیس (Mapping) ---
# نام فایل محلی : اسلاگ دسته‌بندی در دیتابیس
icon_mapping = {
    "nuts.png": "nuts",
    "saffron.png": "saffron",
    "sweets.png": "sweets",
    "handicrafts.png": "handicrafts",
    "flower.png": "flowers", # اصلاح شده: فایل flower به دسته flowers
    "herbal-tea.png": "herbal-tea",
    "gift-packs.png": "gift-packs",
    "chocolate.png": "chocolates" # اصلاح شده: فایل chocolate به دسته chocolates
}

# مسیر پوشه دانلودهای شما
base_path = r"C:\Users\Bahador\Downloads"

print("🚀 شروع عملیات آپلود و متصل‌سازی آیکون‌ها...\n")

for file_name, category_slug in icon_mapping.items():
    file_path = os.path.join(base_path, file_name)
    
    if os.path.exists(file_path):
        # نام فایل در استوریج (برای اینکه تمیز باشه نام اصلی رو می‌ذاریم)
        storage_path = f"icons/{file_name}"
        
        # تشخیص نوع فایل
        mime_type, _ = mimetypes.guess_type(file_path) or "image/png"

        try:
            print(f"🔄 در حال آپلود {file_name}...")
            
            # ۱. آپلود فایل به استوریج
            with open(file_path, 'rb') as f:
                supabase.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=f,
                    file_options={"content-type": mime_type, "upsert": "true"}
                )
            
            # ۲. دریافت لینک عمومی
            public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
            
            # ۳. آپدیت کردن جدول دسته‌بندی‌ها در دیتابیس
            print(f"🔗 متصل کردن لینک به دسته‌بندی '{category_slug}'...")
            data, count = supabase.table("categories").update({"icon_url": public_url}).eq("slug", category_slug).execute()
            
            print(f"✅ موفقیت‌آمیز: {file_name} آپلود و به '{category_slug}' متصل شد.")
            print("-" * 40)
            
        except Exception as e:
            print(f"❌ خطا در پردازش {file_name}: {e}")
    else:
        print(f"⚠️ فایل در مسیر زیر پیدا نشد: {file_path}")

print("\n✨ تمام آیکون‌ها با موفقیت آپدیت شدند. سایت رو چک کن!")