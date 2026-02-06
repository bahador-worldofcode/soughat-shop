import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// جلوگیری از کش شدن (چون قیمت‌ها لحظه‌ای عوض میشن و کرون‌جاب باید دیتای تازه بگیره)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheetUrl = process.env.MARKET_RATES_SHEET_URL;
    if (!sheetUrl) {
      throw new Error('لینک گوگل شیت در تنظیمات پیدا نشد! (MARKET_RATES_SHEET_URL)');
    }

    console.log('🔄 [Step 1] Start: Fetching rates from Google Sheet...');

    // ---------------------------------------------------------
    // بخش ۱: دانلود و آپدیت نرخ‌ها از گوگل شیت (کد اصلی قبلی)
    // ---------------------------------------------------------
    
    // 1. دانلود فایل CSV از گوگل
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`خطا در دانلود فایل شیت: ${response.statusText}`);
    }
    const csvText = await response.text();

    // 2. پردازش متن CSV
    const rows = csvText.split('\n');
    const updates = [];

    for (const row of rows) {
      // جدا کردن ستون A و B با کاما
      const [key, rateStr] = row.split(',');

      // تمیزکاری داده‌ها
      const cleanKey = key?.trim();
      const cleanRateStr = rateStr?.trim(); 

      if (cleanKey && cleanRateStr) {
        // حذف کاراکترهای غیرعددی احتمالی (مثل ویرگول داخل عدد)
        const safeRateStr = cleanRateStr.replace(/,/g, ''); 
        const rate = parseFloat(safeRateStr);
        
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
      return NextResponse.json({ error: 'هیچ داده‌ای در فایل CSV یافت نشد یا فرمت صحیح نیست.' }, { status: 400 });
    }

    // 3. ذخیره نرخ‌ها در دیتابیس market_rates
    const { error: ratesError } = await supabaseAdmin
      .from('market_rates')
      .upsert(updates, { onConflict: 'key' });

    if (ratesError) {
      console.error('Supabase Error (Rates):', ratesError);
      return NextResponse.json({ error: ratesError.message }, { status: 500 });
    }

    console.log(`✅ [Step 1] Rates Updated: ${updates.length} items.`);

    // ---------------------------------------------------------
    // بخش ۲: آپدیت قیمت محصولات طلا (منطق جدید و تکمیلی)
    // ---------------------------------------------------------

    console.log('💎 [Step 2] Start: Updating Gold Products...');

    // الف) پیدا کردن نرخ طلای ۱۸ عیار از بین نرخ‌های دانلود شده
    // فرض بر این است که در گوگل شیت کلیدی به نام 'gold_18k' داریم
    const goldRateObj = updates.find(u => u.key === 'gold_18k');
    const currentGoldRate = goldRateObj ? goldRateObj.rate : null;

    let goldUpdatedCount = 0;
    let message = `${updates.length} نرخ ارز/طلا آپدیت شد.`;

    if (currentGoldRate) {
        // ب) دریافت تنظیمات مورد نیاز برای محاسبه قیمت (دلار، سود، هزینه ارسال)
        const { data: settingsData } = await supabaseAdmin.from('site_settings').select('*');
        
        // مقادیر پیش‌فرض (جهت جلوگیری از کرش کردن در صورت خالی بودن دیتابیس)
        const settings: any = {
            dollar_rate: 100000,     
            gold_markup_percent: 40, 
            shipping_base: 0         
        };

        if (settingsData) {
            settingsData.forEach((item: any) => {
                if (item.key === 'dollar_rate') settings.dollar_rate = Number(item.value) || 100000;
                if (item.key === 'gold_markup_percent') settings.gold_markup_percent = Number(item.value) || 40;
                if (item.key === 'shipping_base') settings.shipping_base = Number(item.value) || 0;
            });
        }

        // ج) دریافت تمام محصولاتی که نوع قیمت‌گذاری آن‌ها 'gold' است
        const { data: goldProducts, error: productError } = await supabaseAdmin
            .from('products')
            .select('id, weight, title') // فقط فیلدهای مورد نیاز
            .eq('pricing_type', 'gold');

        if (productError) {
            console.error('Error fetching gold products:', productError);
        }

        if (goldProducts && goldProducts.length > 0) {
            console.log(`Found ${goldProducts.length} gold products to update.`);

            // د) حلقه محاسبه و آپدیت برای تک تک محصولات طلا
            for (const product of goldProducts) {
                // چک کردن اینکه وزن معتبر باشد
                const weight = Number(product.weight) || 0;
                if (weight <= 0) continue;

                // --- فرمول محاسبه ---
                // 1. قیمت طلای خام محصول: وزن * نرخ گرم طلا
                const rawMaterialPrice = weight * currentGoldRate;

                // 2. اعمال ضریب سود (شامل اجرت و سود فروشنده): قیمت خام * (1 + درصد/100)
                const priceWithMarkup = rawMaterialPrice * (1 + settings.gold_markup_percent / 100);

                // 3. اضافه کردن هزینه ثابت ارسال به قیمت تومانی
                const finalTomanPrice = Math.round(priceWithMarkup + settings.shipping_base);

                // 4. تبدیل به دلار (جهت نمایش و پرداخت در سایت)
                // قیمت نهایی تومان تقسیم بر نرخ دلار
                // Math.round(... * 100) / 100 برای داشتن حداکثر 2 رقم اعشار
                const finalUSDPrice = Math.round((finalTomanPrice / settings.dollar_rate) * 100) / 100;

                // ه) انجام آپدیت در دیتابیس
                await supabaseAdmin
                    .from('products')
                    .update({
                        price_toman: finalTomanPrice,
                        price: finalUSDPrice
                    })
                    .eq('id', product.id);
                
                goldUpdatedCount++;
            }
            message += ` همچنین قیمت ${goldUpdatedCount} محصول طلا بر اساس نرخ جدید (${currentGoldRate.toLocaleString()} T) محاسبه و اعمال شد.`;
        } else {
            console.log('No products with pricing_type="gold" found.');
            message += ' محصول طلایی برای آپدیت یافت نشد.';
        }

    } else {
        console.warn('⚠️ هشدار: کلید "gold_18k" در فایل گوگل شیت پیدا نشد. قیمت محصولات طلا آپدیت نمی‌شود.');
        message += ' (هشدار: نرخ طلا gold_18k یافت نشد)';
    }

    console.log('✅ All Done.');

    return NextResponse.json({ 
      success: true, 
      message: message,
      data: {
          updated_rates_count: updates.length,
          updated_gold_products: goldUpdatedCount,
          rates: updates // برای دیباگ نرخ‌ها رو برمی‌گردونیم
      } 
    });

  } catch (error: any) {
    console.error('CRITICAL Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}