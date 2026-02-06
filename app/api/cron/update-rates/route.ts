import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// جلوگیری از کش شدن (چون قیمت‌ها لحظه‌ای عوض میشن)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheetUrl = process.env.MARKET_RATES_SHEET_URL;
    if (!sheetUrl) {
      throw new Error('لینک گوگل شیت در تنظیمات پیدا نشد!');
    }

    console.log('🔄 در حال دریافت نرخ‌ها از گوگل شیت...');

    // 1. دانلود فایل CSV از گوگل
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    const csvText = await response.text();

    // 2. پردازش متن CSV
    // هر خط رو جدا می‌کنیم
    const rows = csvText.split('\n');
    
    const updates = [];

    for (const row of rows) {
      // جدا کردن ستون A و B با کاما
      const [key, rateStr] = row.split(',');

      // تمیزکاری داده‌ها
      const cleanKey = key?.trim();
      // حذف فاصله و خط جدید از قیمت
      const cleanRateStr = rateStr?.trim(); 

      if (cleanKey && cleanRateStr) {
        const rate = parseFloat(cleanRateStr);
        
        if (!isNaN(rate)) {
          updates.push({
            key: cleanKey,
            rate: rate,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'هیچ داده‌ای یافت نشد' }, { status: 400 });
    }

    // 3. ذخیره در دیتابیس (Upsert یعنی اگر بود آپدیت کن، نبود بساز)
    const { error } = await supabaseAdmin
      .from('market_rates')
      .upsert(updates, { onConflict: 'key' });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${updates.length} نرخ با موفقیت آپدیت شد.`,
      data: updates 
    });

  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}