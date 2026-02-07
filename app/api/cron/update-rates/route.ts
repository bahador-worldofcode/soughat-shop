import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// جلوگیری از کش شدن (چون قیمت‌ها لحظه‌ای عوض میشن و کرون‌جاب باید دیتای تازه بگیره)
export const dynamic = 'force-dynamic';

// --------------------------------------------------------------------------
// تنظیمات سود (درصد)
// --------------------------------------------------------------------------
// سود سکه (پوشش نوسان و خواب سرمایه)
const COIN_PROFIT_PERCENT = 12; 

// سود حواله/ارسال پول (کمتر از سکه چون ریسک فیزیکی ندارد)
const CURRENCY_PROFIT_PERCENT = 12;

export async function GET() {
  try {
    const sheetUrl = process.env.MARKET_RATES_SHEET_URL;
    if (!sheetUrl) {
      throw new Error('لینک گوگل شیت در تنظیمات پیدا نشد! (MARKET_RATES_SHEET_URL)');
    }

    console.log('🔄 [Step 1] Start: Fetching rates from Google Sheet...');

    // =========================================================================
    // بخش ۱: دانلود و آپدیت نرخ‌ها از گوگل شیت
    // =========================================================================
    
    // 1. دانلود فایل CSV از گوگل
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`خطا در دانلود فایل شیت: ${response.statusText}`);
    }
    const csvText = await response.text();

    // 2. پردازش متن CSV
    const rows = csvText.split('\n');
    const updates = [];

    // نگاشت نرخ‌ها برای دسترسی سریع (Dictionary Map)
    const ratesMap: Record<string, number> = {};

    for (const row of rows) {
      const [key, rateStr] = row.split(',');
      const cleanKey = key?.trim();
      const cleanRateStr = rateStr?.trim(); 

      if (cleanKey && cleanRateStr) {
        const safeRateStr = cleanRateStr.replace(/,/g, ''); 
        const rate = parseFloat(safeRateStr);
        
        if (!isNaN(rate)) {
          updates.push({
            key: cleanKey,
            rate: rate,
            updated_at: new Date().toISOString(),
          });
          ratesMap[cleanKey] = rate;
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'هیچ داده‌ای در فایل CSV یافت نشد.' }, { status: 400 });
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


    // =========================================================================
    // بخش ۲: دریافت تنظیمات کلی سایت (دلار، سود طلا و...)
    // =========================================================================
    
    const { data: settingsData } = await supabaseAdmin.from('site_settings').select('*');
    
    // مقادیر پیش‌فرض
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


    // =========================================================================
    // بخش ۳: آپدیت قیمت محصولات "طلا" (Pricing Type = 'gold')
    // =========================================================================
    console.log('💎 [Step 3] Start: Updating Gold Products...');
    
    const currentGoldRate = ratesMap['gold_18k'];
    let goldUpdatedCount = 0;
    let message = `${updates.length} نرخ آپدیت شد.`;

    if (currentGoldRate) {
        const { data: goldProducts } = await supabaseAdmin
            .from('products')
            .select('id, weight')
            .eq('pricing_type', 'gold');

        if (goldProducts && goldProducts.length > 0) {
            for (const product of goldProducts) {
                const weight = Number(product.weight) || 0;
                if (weight <= 0) continue;

                const rawMaterialPrice = weight * currentGoldRate;
                const priceWithMarkup = rawMaterialPrice * (1 + settings.gold_markup_percent / 100);
                const finalTomanPrice = Math.round(priceWithMarkup + settings.shipping_base);
                const finalUSDPrice = Math.round((finalTomanPrice / settings.dollar_rate) * 100) / 100;

                await supabaseAdmin.from('products').update({
                    price_toman: finalTomanPrice,
                    price: finalUSDPrice
                }).eq('id', product.id);
                
                goldUpdatedCount++;
            }
            message += ` | طلا: ${goldUpdatedCount}`;
        }
    }


    // =========================================================================
    // بخش ۴: آپدیت قیمت محصولات "سکه" (Pricing Type = coin_full, ...)
    // =========================================================================
    console.log('🪙 [Step 4] Start: Updating Coin Products...');

    const coinTypes = ['coin_full', 'coin_half', 'coin_quarter', 'coin_grami'];
    
    const { data: coinProducts } = await supabaseAdmin
        .from('products')
        .select('id, pricing_type')
        .in('pricing_type', coinTypes);

    let coinUpdatedCount = 0;

    if (coinProducts && coinProducts.length > 0) {
        for (const product of coinProducts) {
            const currentCoinRate = ratesMap[product.pricing_type || ''];

            if (currentCoinRate) {
                const priceWithProfit = currentCoinRate * (1 + COIN_PROFIT_PERCENT / 100);
                const finalTomanPrice = Math.round(priceWithProfit + settings.shipping_base);
                const finalUSDPrice = Math.round((finalTomanPrice / settings.dollar_rate) * 100) / 100;

                await supabaseAdmin.from('products').update({
                    price_toman: finalTomanPrice,
                    price: finalUSDPrice
                }).eq('id', product.id);

                coinUpdatedCount++;
            }
        }
        message += ` | سکه: ${coinUpdatedCount}`;
    }


    // =========================================================================
    // بخش ۵: آپدیت قیمت محصولات "ارسال پول/حواله" (Pricing Type = 'currency')
    // =========================================================================
    console.log('💵 [Step 5] Start: Updating Currency Products...');

    const { data: currencyProducts } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('pricing_type', 'currency');

    let currencyUpdatedCount = 0;

    if (currencyProducts && currencyProducts.length > 0) {
        // واحد پایه محاسبه: ۱ میلیون تومان
        const BASE_TOMAN_UNIT = 1000000;
        
        // اطمینان از اینکه نرخ دلار معتبر است
        let dollarRateForCalc = settings.dollar_rate;
        if (!dollarRateForCalc || dollarRateForCalc < 1000) {
             // اگر نرخ دلار در تنظیمات نبود، از نرخ زنده بازار استفاده کن
             dollarRateForCalc = ratesMap['usd'] || 100000;
        }

        // محاسبه: (۱ میلیون تومان تقسیم بر دلار) + درصد سود حواله
        const rawDollarPrice = BASE_TOMAN_UNIT / dollarRateForCalc;
        const finalUSDPrice = rawDollarPrice * (1 + CURRENCY_PROFIT_PERCENT / 100);
        
        // رند کردن تا ۲ رقم اعشار
        const roundedUSDPrice = Math.round(finalUSDPrice * 100) / 100;

        for (const product of currencyProducts) {
             await supabaseAdmin.from('products').update({
                price_toman: BASE_TOMAN_UNIT, // قیمت تومانی همیشه ۱ میلیون فیکس (واحد پایه)
                price: roundedUSDPrice
            }).eq('id', product.id);
            currencyUpdatedCount++;
        }
        message += ` | حواله: ${currencyUpdatedCount}`;
    }

    console.log('✅ All Done.');

    return NextResponse.json({ 
      success: true, 
      message: message,
      data: {
          updated_rates_count: updates.length,
          updated_gold_products: goldUpdatedCount,
          updated_coin_products: coinUpdatedCount,
          updated_currency_products: currencyUpdatedCount,
          rates_preview: ratesMap 
      } 
    });

  } catch (error: any) {
    console.error('CRITICAL Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}