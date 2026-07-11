# WALLET_SYSTEM_SETUP.md
### افزودن سیستم کیف‌پول داخلی (شارژ با کریپتو + پرداخت سفارش با کیف‌پول) — نقشه‌راه گام‌به‌گام

> این سند را داخل ریشه‌ی پروژه نگه دار (کنار `ROADMAP.md`، `GOOGLE_OAUTH_SETUP.md` و `EMAIL_PASSWORD_AUTH_SETUP.md`).
> هر تسک یک چک‌باکس دارد؛ وقتی انجامش دادی بنویس `[x]` به‌جای `[ ]`.
> تسک‌ها عمداً ریز و پشت‌سرهم چیده شده‌اند تا بشه روزی چندتاش رو با حوصله انجام داد.
> برخلاف سند ایمیل، این یک سند *برنامه‌ریزی* است، یعنی هنوز هیچ‌کدام از تسک‌ها انجام نشده؛ کدهای داخل هر تسک، پیشنهاد پیاده‌سازی هستند نه گزارش کاری که قبلاً انجام شده.

---

## ۰) تصمیم‌های معماری (این بخش رو فقط بخون، تسک نداره)

توضیحاتت کامل بود، ولی چند جا مردد بودی. اینجا هر کدوم رو با دلیل جواب می‌دم تا کل تیم (خودت، هر برنامه‌نویس دیگه، و خودِ من در تسک‌های بعدی) دقیقاً روی یک مدل کار کنیم.

**۱) کیف‌پول با کدوم ارز حساب می‌شه؟**
دقیقاً مثل جدول `orders` که همین الان داری: هرجا مبلغی نمایش داده می‌شه یک **ارز نمایشیِ دلخواه** (`display_currency`) هست، ولی زیرِ پوسته همه‌چیز بر پایه‌ی **دلار (USD)** محاسبه و ذخیره می‌شه (`total_price`). دقیقاً همین الگو رو برای کیف‌پول هم پیاده می‌کنیم: مشتری با هر کدوم از ۴ ارزِ همین الانِ سایت (USD/EUR/GBP/SEK) درخواست شارژ می‌ده (مثلاً «۲۰۰ یورو»)، ولی موجودیِ واقعیِ کیف‌پولش در دیتابیس همیشه به دلار ذخیره می‌شه (`profiles.wallet_balance_usd`). این تصمیم دو تا فایده‌ی مستقیم داره: (الف) کاملاً با همون منطقی که همین حالا در `lib/store.ts` و چک‌اوت داری هماهنگه، هیچ سیستم موازی جدیدی لازم نیست. (ب) وقتی مشتری بخواد با کیف‌پولش سفارش بخره، چون `orders.total_price` هم دلاریه، مقایسه و کسر موجودی بدون هیچ تبدیل واحدی و بدون خطای گرد کردن انجام می‌شه.

**۲) شارژ کیف‌پول خودکار باشه یا دستی؟**
جواب کوتاه: **خودکار، ولی بعد از یک تاییدِ دستیِ ادمین** — یعنی همون چیزی که خودت در پیام آخرت بهش رسیدی. جزئیات: مشتری فاکتور شارژ می‌سازه (وضعیت `pending`)، دقیقاً مثل سفارش‌های عادی روی «من پرداخت کردم» می‌زنه (که فقط یک پیام تلگرام برای ادمین می‌فرسته، هنوز هیچ پولی جابه‌جا نشده)، و **ادمین** وقتی از رسیدن پرداخت مطمئن شد، در پنل ادمین وضعیت فاکتور رو به «پرداخت‌شده» تغییر می‌ده. همین یک کلیکِ ادمین، هم تاییدِ انسانی محسوب می‌شه (که نگرانی‌ات درباره‌ی اشتباه رو حل می‌کنه) و هم به‌صورت خودکار (بدون هیچ کار دستیِ اضافه‌ای مثل تایپ عدد در یک فرم جدا) موجودی کیف‌پول رو شارژ می‌کنه. یعنی خودِ عمل «تغییر وضعیت» = هم تایید هم شارژ؛ یک اقدام، نه دو تا.

**۳) ایمیل تاییدی یا نوتیف داخل‌سایتی؟**
با نگرانی‌ات موافقم و **ایمیل رو کنار می‌ذاریم**. دلیلت درسته: با زیاد شدن مشتری‌ها، ریسک واقعی داره که ادمین فاکتور اشتباهی رو تایید کنه و یک ایمیل بد به مشتری اشتباه بره — و برگردوندنش (چه از نظر فنی چه از نظر آبرو) سخته. به‌جاش یک **آیکون زنگوله‌ی نوتیف** می‌سازیم (هم در هدر دسکتاپ، هم در منوی موبایل)؛ همون لحظه‌ای که ادمین فاکتور رو تایید می‌کنه، یک ردیف نوتیف داخل دیتابیس ساخته می‌شه و مشتری با باز کردن سایت (نه یک ایمیل خارجی) می‌بینتش. اگر یک وقت اشتباهی هم رخ بده، فقط یک پیام داخل‌سایتی دیده شده، نه یک ایمیل رسمی که به گوگل/اوت‌لوک مشتری رفته باشه — تبعاتش خیلی سبک‌تره.

**۴) چرا یک کامپوننت/روتِ جدید به‌جای دست‌بردن توی `CryptoPayment.tsx` و `app/api/crypto/calc/route.ts`؟**
چون این دو تا همین الان برای فلوی خریدِ واقعی (که پول واقعی جابه‌جا می‌کنه) کاملاً تست‌شده و در حال کار هستن. تغییر دادنشون برای این‌که هم به سفارش‌ها هم به شارژ کیف‌پول سرویس بدن، یعنی یک شرط (`if type === 'order' ...`) وسط یک مسیر حساسِ مالی — دقیقاً همون نوع پیچیدگی که خودت گفتی نگرانشی. به‌جاش یک کپیِ کوچک و مستقل می‌سازیم (`WalletTopupPayment.tsx` و `app/api/wallet/topup/calc/route.ts`) که فقط برای شارژ کیف‌پول کار می‌کنه. کمی کد تکراری داریم، ولی در عوض یک باگ در مسیر شارژ کیف‌پول هیچ‌وقت نمی‌تونه فلوی خرید سفارش رو بشکنه (و برعکس).

**۵) «راحت پرداخت از طریق کیف‌پول رو می‌زنه و سفارش ثبت می‌شه» — این خودش یک فاز کامل جداست.**
این دقیقاً همون هدف اصلی‌ایه که کل این فیچر رو داری می‌سازی (که دیگه لازم نباشه هر سفارش رو پیام بدی). پس علاوه بر «شارژ کیف‌پول»، یک فاز کامل هم برای «پرداخت سفارش با کیف‌پول در چک‌اوت» گذاشتم (فاز ۵). این مسیر با مسیر کریپتو فرق مهمی داره: چون کسرِ موجودی از کیف‌پول کاملاً سمت سرور و اتمیک تایید می‌شه، **نیازی به تایید دستی ادمین نداره** و سفارش بلافاصله `paid` می‌شه — ادمین فقط برای آماده‌سازی و ارسال کالا پیام تلگرام می‌گیره، نه برای تایید پرداخت.

**۶) چرا برای هر اقدام مالی یک تابع دیتابیسی (RPC) ساختیم، نه فقط یک `UPDATE` ساده در API Route؟**
چون «خوندن موجودی → جمع/تفریق در جاوااسکریپت → نوشتن موجودی جدید» بین دو درخواست هم‌زمان می‌تونه باگ کلاسیکِ **race condition** بسازه (مثلاً مشتری دو بار سریع روی «پرداخت با کیف‌پول» بزنه، یا ادمین دو بار پشت سر هم روی «تایید» بزنه). یک تابع Postgres با `for update` (قفل ردیف) این کار رو در یک تراکنشِ واحد و اتمیک انجام می‌ده — یا کامل انجام می‌شه یا اصلاً انجام نمی‌شه، و هیچ‌وقت دوبار حساب نمی‌شه.

**۷) یک نکته‌ی امنیتی که ضمنِ کار کردن روی این فیچر پیدا کردم (و باید همین الان درستش کنیم):**
پالیسیِ فعلیِ `update` روی جدول `profiles` (در `supabase/profiles.sql`) هیچ محدودیتی روی *کدوم ستون* قابل تغییره نداره — فقط چک می‌کنه که کاربر صاحبِ همون ردیفه. یعنی همین الان هم (قبل از این فیچر) تئوریاً هر مشتری لاگین‌کرده می‌تونه با یک درخواست مستقیم به سوپابیس، ستون `is_admin` خودش رو `true` کنه! وقتی `wallet_balance_usd` رو هم اضافه کنیم، همین مشکل روی موجودی کیف‌پول هم صدق می‌کنه. توی فاز ۱ یک تسک گذاشتم که هر دو ستون حساس (`is_admin` و `wallet_balance_usd`) رو با محدودیتِ سطحِ ستون قفل می‌کنه — یک اصلاح کوچیک ولی مهم که بهتره همزمان با این فیچر انجام بشه.

**۸) namespaceِ ترجمه‌ی کیف‌پول — یک اصلاحِ کوچیک حین کار (تسکِ ۲۹):**
موقعِ اضافه‌کردنِ سوییچرِ پرداختِ چک‌اوت، دیدم متن‌هایی مثل «موجودی کافی نیست» هم توی تبِ کیف‌پولِ پروفایل لازمن هم توی چک‌اوت. کدِ فاز ۳ (تسک‌های ۱۹-۲۶) قبلاً این کلیدها رو با `t('wallet.xxx')` صدا می‌زد، یعنی `t` همون مترجمِ namespaceِ `Profile` بود — پس این کلیدها عملاً زیرِ `Profile.wallet.*` تعریف می‌شدن. اگه همینو نگه می‌داشتیم، یا باید توی چک‌اوت هم دوباره همون کلیدها رو زیرِ `Checkout.wallet.*` تکرار می‌کردیم (دوپلیکیشن)، یا یک namespace بی‌ربط رو صدا می‌زدیم. به‌جاش یک مترجمِ مستقل ساختم: `const tWallet = useTranslations('Wallet');`، هم در `profile/page.tsx` هم در `checkout/page.tsx`، و تمام ۱۷ فراخوانیِ قبلیِ `t('wallet.X')` در پروفایل رو به `tWallet('X')` تغییر دادم. این دقیقاً همون namespaceِ مستقلِ `Wallet` است که تسکِ ۳۹ از اول برایش برنامه‌ریزی شده بود؛ فقط الان زودتر (همین امروز) ساختیمش تا کدِ چک‌اوت هم از روز اول درست بهش وصل بشه، نه اینکه بعداً دوباره رفکتور کنیم. (تبِ «کیف‌پول» در منوی پروفایل — یعنی `t('tabs.wallet')` — جای خودش می‌مونه و به این namespace ربطی نداره؛ اون یک کلیدِ ساده‌ی داخلِ خودِ `Profile` است، نه محتوای کیف‌پول.)

نتیجه‌ی نهایی که بهش می‌رسیم: مشتری در پنل کاربری‌اش یک تب «کیف‌پول» می‌بینه، می‌تونه با هر ارزی که دلش می‌خواد شارژش کنه (دقیقاً با همون تجربه‌ی کاربریِ چک‌اوتِ فعلی — فاکتور، انتخاب کریپتو، دکمه‌ی واتساپ برای آدرس)، بعد از تاییدِ ادمین یک نوتیف داخل‌سایتی می‌گیره، و از همون لحظه می‌تونه در چک‌اوت به‌جای کریپتو، مستقیم با موجودیِ کیف‌پولش سفارش ثبت کنه — بدون فرستادن حتی یک پیام.

---

## فاز ۱ — پایگاه‌داده (SQL در Supabase SQL Editor)

- [x] **تسک ۱:** ستون موجودی به `profiles` اضافه کن:
  ```sql
  alter table public.profiles
    add column if not exists wallet_balance_usd numeric not null default 0;
  ```

- [x] **تسک ۲:** جدول فاکتورهای شارژ (`wallet_topups`) رو بساز — هر ردیف یعنی «مشتری درخواست شارژ به این مبلغ رو داده»:
  ```sql
  create table if not exists public.wallet_topups (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references auth.users (id) on delete cascade,
    requested_currency text not null check (requested_currency in ('USD','EUR','GBP','SEK')),
    requested_amount   numeric not null check (requested_amount > 0),
    amount_usd         numeric not null check (amount_usd > 0),
    payment_method     text, -- نماد کریپتو انتخاب‌شده، مثل USDT یا SOL
    status             text not null default 'pending' check (status in ('pending','paid','cancelled')),
    credited           boolean not null default false,
    created_at         timestamptz not null default now(),
    paid_at            timestamptz
  );

  create index if not exists wallet_topups_user_id_idx on public.wallet_topups (user_id);
  create index if not exists wallet_topups_status_idx on public.wallet_topups (status);
  ```

- [x] **تسک ۳:** دفترِ کلِ تراکنش‌های کیف‌پول (`wallet_transactions`) رو بساز — این جدول فقط برای *ثبت تاریخچه*‌ست و هیچ‌وقت مستقیماً توسط کلاینت نوشته نمی‌شه (فقط از داخل توابع RPC فاز بعد):
  ```sql
  create table if not exists public.wallet_transactions (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references auth.users (id) on delete cascade,
    type               text not null check (type in ('topup','order_payment','admin_adjustment')),
    amount_usd         numeric not null, -- مثبت = واریز به کیف‌پول، منفی = برداشت از کیف‌پول
    balance_after_usd  numeric not null, -- عکسِ فوریِ موجودی بعد از این تراکنش (برای رسیدگی و اثبات)
    related_topup_id   uuid references public.wallet_topups (id),
    related_order_id   uuid references public.orders (id),
    note               text,
    created_at         timestamptz not null default now()
  );

  create index if not exists wallet_transactions_user_id_idx on public.wallet_transactions (user_id);
  ```

- [x] **تسک ۴:** جدول نوتیف‌ها (`notifications`) رو بساز — فعلاً فقط برای شارژ کیف‌پول استفاده می‌شه ولی طوری طراحی شده که بعداً برای نوتیف‌های دیگه (مثلاً تغییر وضعیت سفارش) هم قابل استفاده باشه:
  ```sql
  create table if not exists public.notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    type        text not null default 'wallet_topup',
    title       text not null,
    message     text not null,
    related_id  uuid,
    is_read     boolean not null default false,
    created_at  timestamptz not null default now()
  );

  create index if not exists notifications_user_id_idx on public.notifications (user_id);
  create index if not exists notifications_unread_idx on public.notifications (user_id, is_read);
  ```

- [x] **تسک ۵:** RLS (امنیتِ سطحِ ردیف) رو برای هر سه جدول جدید فعال و تنظیم کن. نکته‌ی مهم: کاربر عادی فقط اجازه‌ی *خواندنِ* تراکنش‌ها و نوتیف‌های خودش رو داره؛ نوشتن روی `wallet_transactions` و تغییرِ وضعیتِ `wallet_topups` **فقط** از سمت سرور (با کلید service role که RLS رو دور می‌زنه) مجازه:
  ```sql
  -- wallet_topups: کاربر می‌تونه فاکتورهای خودش رو ببینه، و یک فاکتورِ pending برای خودش بسازه
  alter table public.wallet_topups enable row level security;

  drop policy if exists "Users can view own topups" on public.wallet_topups;
  create policy "Users can view own topups"
    on public.wallet_topups for select
    using (auth.uid() = user_id);

  drop policy if exists "Users can create own pending topup" on public.wallet_topups;
  create policy "Users can create own pending topup"
    on public.wallet_topups for insert
    with check (auth.uid() = user_id and status = 'pending' and credited = false);

  -- عمداً هیچ policy ای برای update/delete تعریف نشده؛ یعنی هیچ کاربر عادی‌ای
  -- (با کلید anon) نمی‌تونه وضعیتِ فاکتور رو خودش تغییر بده — فقط سرور می‌تونه.

  -- wallet_transactions: فقط خواندنِ تراکنش‌های خودت؛ نوشتن اصلاً از کلاینت مجاز نیست
  alter table public.wallet_transactions enable row level security;

  drop policy if exists "Users can view own transactions" on public.wallet_transactions;
  create policy "Users can view own transactions"
    on public.wallet_transactions for select
    using (auth.uid() = user_id);

  -- notifications: خواندن و علامت‌زدنِ خوانده‌شده برای خودت
  alter table public.notifications enable row level security;

  drop policy if exists "Users can view own notifications" on public.notifications;
  create policy "Users can view own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

  drop policy if exists "Users can mark own notifications read" on public.notifications;
  create policy "Users can mark own notifications read"
    on public.notifications for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  ```

- [x] **تسک ۶ (مهم، امنیتی):** طبق نکته‌ی شماره‌ی ۷ در بخش تصمیم‌های معماری، جلوی تغییرِ مستقیمِ ستون‌های حساسِ `profiles` رو از سمت کلاینت بگیر:
  ```sql
  revoke update (wallet_balance_usd, is_admin) on public.profiles from authenticated;
  ```
  (این خط، پالیسیِ فعلیِ «کاربر می‌تونه پروفایل خودش رو آپدیت کنه» رو کاملاً دست‌نخورده نگه می‌داره — کاربر همچنان می‌تونه `full_name`، `phone`، `country`، `avatar_url` خودش رو عوض کنه؛ فقط این دو ستونِ خاص دیگه از طریق کلاینت قابل نوشتن نیستن، حتی برای صاحبِ ردیف. تغییرشون فقط از طریق سرور با کلید service role ممکنه.)

- [x] **تسک ۷:** تابعِ اتمیکِ «شارژ کیف‌پول بعد از تاییدِ ادمین» رو بساز:
  ```sql
  create or replace function public.credit_wallet_topup(p_topup_id uuid)
  returns boolean
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    v_topup public.wallet_topups%rowtype;
    v_new_balance numeric;
  begin
    -- قفلِ ردیف تا از دو بار پردازشِ هم‌زمان (مثلاً دو تب باز ادمین) جلوگیری بشه
    select * into v_topup from public.wallet_topups where id = p_topup_id for update;

    if not found then
      raise exception 'TOPUP_NOT_FOUND';
    end if;

    -- ایمن در برابر کلیکِ دوباره: اگه قبلاً شارژ شده، دوباره شارژ نکن، فقط false برگردون
    if v_topup.status = 'paid' or v_topup.credited = true then
      return false;
    end if;

    update public.profiles
      set wallet_balance_usd = wallet_balance_usd + v_topup.amount_usd
      where id = v_topup.user_id
      returning wallet_balance_usd into v_new_balance;

    insert into public.wallet_transactions (user_id, type, amount_usd, balance_after_usd, related_topup_id, note)
    values (v_topup.user_id, 'topup', v_topup.amount_usd, v_new_balance, v_topup.id, 'شارژ کیف‌پول تایید‌شده توسط ادمین');

    update public.wallet_topups
      set status = 'paid', credited = true, paid_at = now()
      where id = v_topup.id;

    insert into public.notifications (user_id, type, title, message, related_id)
    values (
      v_topup.user_id,
      'wallet_topup',
      'کیف‌پولت شارژ شد',
      'کیف‌پول شما به مبلغ ' || v_topup.requested_currency || ' ' || v_topup.requested_amount || ' شارژ شد. می‌توانید همین الان خرید کنید.',
      v_topup.id
    );

    return true;
  end;
  $$;

  revoke execute on function public.credit_wallet_topup(uuid) from public, anon, authenticated;
  ```
  (خطِ آخر عمداً اجرای این تابع رو از هر نقشی به‌جز `service_role` می‌گیره، چون این تابع با `security definer` اجرا می‌شه و RLS رو دور می‌زنه — نباید هیچ کلاینتی مستقیم بتونه صداش بزنه. بعد از اجرای این SQL، این کوئری رو هم بزن و مطمئن شو خروجی `true` است — یعنی نقشِ سرویس هنوز دسترسیِ اجرا داره: `select has_function_privilege('service_role', 'public.credit_wallet_topup(uuid)', 'execute');` اگر `false` بود، این خط رو هم اجرا کن: `grant execute on function public.credit_wallet_topup(uuid) to service_role;`)

- [x] **تسک ۸:** تابعِ اتمیکِ «پرداختِ سفارش با کیف‌پول» رو بساز:
  ```sql
  create or replace function public.pay_order_with_wallet(p_order_id uuid, p_user_id uuid)
  returns boolean
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    v_order public.orders%rowtype;
    v_balance numeric;
    v_new_balance numeric;
  begin
    select wallet_balance_usd into v_balance from public.profiles where id = p_user_id for update;
    if not found then
      raise exception 'USER_NOT_FOUND';
    end if;

    select * into v_order from public.orders
      where id = p_order_id and user_id = p_user_id and status = 'pending'
      for update;

    if not found then
      raise exception 'ORDER_NOT_PAYABLE';
    end if;

    if v_balance < v_order.total_price then
      raise exception 'INSUFFICIENT_BALANCE';
    end if;

    update public.profiles
      set wallet_balance_usd = wallet_balance_usd - v_order.total_price
      where id = p_user_id
      returning wallet_balance_usd into v_new_balance;

    insert into public.wallet_transactions (user_id, type, amount_usd, balance_after_usd, related_order_id, note)
    values (p_user_id, 'order_payment', -v_order.total_price, v_new_balance, v_order.id, 'پرداخت سفارش با کیف‌پول');

    update public.orders set status = 'paid' where id = v_order.id;

    return true;
  end;
  $$;

  revoke execute on function public.pay_order_with_wallet(uuid, uuid) from public, anon, authenticated;
  ```
  (نکته: این تابع فقط سفارش‌هایی که `user_id` دقیقاً برابرِ همون کاربرِ لاگین‌کرده باشه رو قبول می‌کنه — یعنی حتی اگه شناسه‌ی یک سفارشِ متعلق به شخص دیگه رو حدس بزنن، قابل پرداخت با کیف‌پولِ یک نفر دیگه نیست. همچنین چون سفارش‌های مهمان `user_id = null` دارن، خودکار از این مسیر رد می‌شن — کاملاً درست، چون پرداخت با کیف‌پول ذاتاً فقط برای کاربرهای لاگین‌کرده معنا داره.)

- [x] **تسک ۹:** تابعِ «تنظیمِ دستیِ موجودی توسط ادمین» رو بساز — این دریچه‌ی اطمینانیه برای وقتی ادمین اشتباهی رخ داده و باید موجودیِ کسی رو دستی اصلاح کنه (مثلاً استرداد وجهِ یک سفارشِ لغوشده):
  ```sql
  create or replace function public.admin_adjust_wallet(p_user_id uuid, p_amount_usd numeric, p_note text default null)
  returns numeric
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    v_new_balance numeric;
  begin
    update public.profiles
      set wallet_balance_usd = wallet_balance_usd + p_amount_usd
      where id = p_user_id
      returning wallet_balance_usd into v_new_balance;

    if not found then
      raise exception 'USER_NOT_FOUND';
    end if;

    insert into public.wallet_transactions (user_id, type, amount_usd, balance_after_usd, note)
    values (p_user_id, 'admin_adjustment', p_amount_usd, v_new_balance, coalesce(p_note, 'اصلاح دستی توسط ادمین'));

    insert into public.notifications (user_id, type, title, message)
    values (
      p_user_id,
      'wallet_adjustment',
      case when p_amount_usd > 0 then 'موجودی کیف‌پولت افزایش یافت' else 'موجودی کیف‌پولت تغییر کرد' end,
      'موجودی کیف‌پول شما توسط پشتیبانی به‌روزرسانی شد.'
    );

    return v_new_balance;
  end;
  $$;

  revoke execute on function public.admin_adjust_wallet(uuid, numeric, text) from public, anon, authenticated;
  ```

---

## فاز ۲ — بک‌اند (API Routes)

> این فاز فایل‌های جدید می‌سازه؛ هیچ فایل موجودی (مثل `app/api/crypto/calc/route.ts` یا `app/api/orders/confirm/route.ts`) دست نمی‌خوره — طبق تصمیم شماره‌ی ۴.

- [x] **تسک ۱۰:** فایل `app/api/wallet/topup/calc/route.ts` رو بساز — دقیقاً هم‌خانواده‌ی `app/api/crypto/calc/route.ts` ولی به‌جای خوندنِ `total_price` از جدول `orders`، مبلغِ `amount_usd` رو از جدول `wallet_topups` می‌خونه (و مثل قبل، نرخِ کریپتو رو لحظه‌ای از Coinbase می‌گیره تا کاربر نتونه با دستکاریِ کلاینت نرخ رو جعل کنه):
  ```ts
  import { NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import BigNumber from 'bignumber.js';

  export const dynamic = 'force-dynamic';

  export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { topupId, symbol } = body;

      if (!topupId || !symbol) {
        return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
      }

      const { data: topup, error: dbError } = await supabaseAdmin
        .from('wallet_topups')
        .select('amount_usd, status')
        .eq('id', topupId)
        .single();

      if (dbError || !topup) {
        return NextResponse.json({ error: 'درخواست شارژ یافت نشد' }, { status: 404 });
      }
      if (topup.status !== 'pending') {
        return NextResponse.json({ error: 'این درخواست دیگر در انتظار پرداخت نیست' }, { status: 409 });
      }

      let rate = 1;
      const cleanSymbol = symbol.toUpperCase().trim();

      if (cleanSymbol !== 'USDT') {
        try {
          const pair = `${cleanSymbol}-USD`;
          const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, { cache: 'no-store' });
          const data = await res.json();
          if (data.data?.amount) {
            rate = parseFloat(data.data.amount);
          } else {
            throw new Error('Invalid price data');
          }
        } catch (err) {
          console.error('API Error:', err);
          return NextResponse.json({ error: 'خطا در دریافت نرخ ارز.' }, { status: 503 });
        }
      }

      const amountUSD = new BigNumber(topup.amount_usd);
      const cryptoRate = new BigNumber(rate);
      const rawAmount = amountUSD.dividedBy(cryptoRate);
      const decimalPlaces = cleanSymbol === 'USDT' ? 2 : 5;
      const roundedAmount = rawAmount.decimalPlaces(decimalPlaces, BigNumber.ROUND_CEIL);
      const payableAmount = roundedAmount.toFixed(decimalPlaces);

      return NextResponse.json({ amount: payableAmount, rate, symbol: cleanSymbol });
    } catch (error: any) {
      console.error('Server Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- [x] **تسک ۱۱:** فایل `app/api/wallet/topup/confirm/route.ts` رو بساز — همون نقشِ `orders/confirm` رو داره: وقتی مشتری دکمه‌ی «من پرداخت کردم» رو می‌زنه، فقط یک پیام تلگرام برای ادمین می‌فرسته (هنوز هیچ پولی جابه‌جا نمی‌شه). برخلاف `orders/confirm`، اینجا ورود اجباریه چون فاکتور به یک حسابِ مشخص وصله:
  ```ts
  import { NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { sendTelegramMessage } from '@/lib/notifyTelegram';

  export async function POST(request: Request) {
    try {
      const { topupId, paymentMethod } = await request.json();

      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      const token=***
      if (!token) return NextResponse.json({ error: 'ورود الزامی است' }, { status: 401 });

      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !userData?.user) {
        return NextResponse.json({ error: 'ورود الزامی است' }, { status: 401 });
      }

      const { data: topup, error } = await supabaseAdmin
        .from('wallet_topups')
        .select('*, profiles(full_name, email, phone)')
        .eq('id', topupId)
        .eq('user_id', userData.user.id)
        .single();

      if (error || !topup) throw new Error('درخواست شارژ یافت نشد');

      const messageText = `
💳 *درخواست شارژ کیف‌پول (پرداخت‌شده توسط مشتری)*
🔖 کد: ${topup.id}
💎 روش پرداخت: ${paymentMethod}
👤 مشتری: ${topup.profiles?.full_name || '-'} (${topup.profiles?.email || '-'})
📱 تلفن: ${topup.profiles?.phone || '-'}
💱 مبلغ درخواستی: ${topup.requested_currency} ${topup.requested_amount}
💵 معادل دلاری: $${topup.amount_usd}
✅ وضعیت: مشتری اعلام پرداخت کرده — منتظر تایید دستی ادمین
➖➖➖➖➖➖➖➖
برای شارژ کیف‌پول، پنل ادمین → «کیف‌پول مشتریان» → تایید کن.
`.trim();

      await sendTelegramMessage(process.env.TELEGRAM_ORDERS_CHAT_ID, messageText);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- [x] **تسک ۱۲:** فایل `app/api/admin/wallet-topups/route.ts` رو بساز و متد `GET` رو اضافه کن — لیستِ همه‌ی فاکتورهای شارژ برای جدولِ پنل ادمین (دقیقاً هم‌الگو با `GET` در `app/api/orders/route.ts`، با `verifyAdmin`):
  ```ts
  import { NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { verifyAdmin } from '@/lib/verifyAdmin';

  export const dynamic = 'force-dynamic';

  export async function GET(request: Request) {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('wallet_topups')
      .select('*, profiles(full_name, email, phone)')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }
  ```

- [x] **تسک ۱۳:** توی همون فایل، متدِ `PATCH` رو اضافه کن — این جاییه که تصمیمِ معماریِ شماره‌ی ۲ عملی می‌شه: تغییر وضعیت به `paid` مستقیم یک `UPDATE` ساده نیست، از تابعِ اتمیکِ فاز قبل عبور می‌کنه:
  ```ts
  export async function PATCH(request: Request) {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    try {
      const { id, status } = await request.json();
      if (!id || !['paid', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'ورودی نامعتبر است' }, { status: 400 });
      }

      if (status === 'cancelled') {
        const { error } = await supabaseAdmin
          .from('wallet_topups')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .eq('status', 'pending'); // فقط اگه هنوز pending باشه قابل لغوه
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // status === 'paid' → از طریق تابع اتمیکِ دیتابیس شارژ می‌کنیم، نه یک UPDATE ساده
      const { data, error } = await supabaseAdmin.rpc('credit_wallet_topup', { p_topup_id: id });
      if (error) throw error;

      if (data === false) {
        return NextResponse.json(
          { error: 'این درخواست قبلاً پردازش شده — دوباره شارژ نشد (برای جلوگیری از شارژ تکراری).' },
          { status: 409 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- [x] **تسک ۱۴:** فایل `app/api/wallet/pay-order/route.ts` رو بساز — این همون روتیه که چک‌اوت در فاز ۵ صداش می‌زنه:
  ```ts
  import { NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { sendTelegramMessage } from '@/lib/notifyTelegram';

  export async function POST(request: Request) {
    try {
      const { orderId } = await request.json();
      if (!orderId) return NextResponse.json({ error: 'شناسه سفارش الزامی است' }, { status: 400 });

      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      const token=***
      if (!token) return NextResponse.json({ error: 'برای پرداخت با کیف‌پول باید وارد حساب شوید.' }, { status: 401 });

      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !userData?.user) {
        return NextResponse.json({ error: 'نشست شما منقضی شده، دوباره وارد شوید.' }, { status: 401 });
      }

      const { error } = await supabaseAdmin.rpc('pay_order_with_wallet', {
        p_order_id: orderId,
        p_user_id: userData.user.id,
      });

      if (error) {
        if (error.message?.includes('INSUFFICIENT_BALANCE')) {
          return NextResponse.json({ error: 'موجودی کیف‌پول شما کافی نیست.' }, { status: 402 });
        }
        if (error.message?.includes('ORDER_NOT_PAYABLE')) {
          return NextResponse.json({ error: 'این سفارش دیگر قابل پرداخت با کیف‌پول نیست.' }, { status: 409 });
        }
        throw error;
      }

      // اعلانِ تلگرام فقط جهتِ اطلاع است؛ چون پرداخت همین الان و به‌صورت اتمیک از
      // کیف‌پول کسر شده، ادمین دیگر نیازی به تاییدِ دستیِ پرداخت ندارد — فقط باید
      // سفارش را آماده و ارسال کند.
      const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
      if (order) {
        const itemsList = (order.items || []).map((item: any) => `▫️ ${item.title} (x${item.quantity})`).join('\n');
        const messageText = `
🛍 *سفارش جدید (پرداخت‌شده با کیف‌پول)*
🔖 کد: ${order.id}
💎 روش پرداخت: Wallet
➖➖➖➖➖➖➖➖
📍 گیرنده: ${order.customer_name} — ${order.city}
🛒 اقلام:
${itemsList}
➖➖➖➖➖➖➖➖
✅ وضعیت: پرداخت‌شده و تاییدشده (نیاز به بررسیِ دستیِ پرداخت نیست، فقط آماده‌سازی و ارسال)
➖➖➖➖➖➖➖➖
`.trim();
        await sendTelegramMessage(process.env.TELEGRAM_ORDERS_CHAT_ID, messageText);
      }

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'خطا در پرداخت' }, { status: 500 });
    }
  }
  ```

- [x] **تسک ۱۵:** فایل `app/api/admin/wallet-adjust/route.ts` رو بساز — دکمه‌ی «تنظیم دستی موجودی» در فاز ۷ این رو صدا می‌زنه:
  ```ts
  import { NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { verifyAdmin } from '@/lib/verifyAdmin';

  export async function POST(request: Request) {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    try {
      const { userId, amountUsd, note } = await request.json();
      if (!userId || typeof amountUsd !== 'number' || amountUsd === 0) {
        return NextResponse.json({ error: 'ورودی نامعتبر است' }, { status: 400 });
      }

      const { error } = await supabaseAdmin.rpc('admin_adjust_wallet', {
        p_user_id: userId,
        p_amount_usd: amountUsd,
        p_note: note || null,
      });
      if (error) throw error;

      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

---

## فاز ۳ — فرانت‌اند: تب «کیف‌پول» در پروفایل (نمایشِ موجودی + تاریخچه)

> فایل هدف: `app/[locale]/profile/page.tsx` (همونی که الان ۳ تب داره: `account`, `addresses`, `orders`).

- [x] **تسک ۱۶:** نوعِ `TabKey` رو گسترش بده و یک آیتمِ تبِ جدید اضافه کن:
  ```ts
  type TabKey = 'account' | 'addresses' | 'orders' | 'wallet';
  ```
  و در آرایه‌ی `tabs` (نزدیکِ همون‌جایی که `{ key: 'orders', ... }` تعریف شده):
  ```ts
  { key: 'wallet', label: t('tabs.wallet'), icon: WalletIcon },
  ```
  (چون `Wallet` به‌عنوان نامِ کامپوننت با آیکونِ `Wallet` از lucide-react تداخل داره، موقعِ ایمپورت اسمش رو عوض کن: `import { Wallet as WalletIcon, ... } from 'lucide-react';`)

- [x] **تسک ۱۷:** استیت‌های جدید برای تب کیف‌پول رو اضافه کن (کنار استیت‌های `orders`):
  ```ts
  interface WalletTx {
    id: string;
    type: 'topup' | 'order_payment' | 'admin_adjustment';
    amount_usd: number;
    balance_after_usd: number;
    note: string | null;
    created_at: string;
  }

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletTx, setWalletTx] = useState<WalletTx[] | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  ```

- [x] **تسک ۱۸:** یک افکت بساز که فقط وقتی کاربر برای اولین‌بار روی تب «کیف‌پول» می‌زنه، موجودی و تاریخچه رو می‌خونه (مستقیم از سوپابیس، چون هر دو جدول پالیسیِ RLSِ «فقط صاحبِ ردیف» دارن — نیازی به یک API Route جدا نیست، دقیقاً مثل همون الگویی که `saved_addresses` در همین صفحه استفاده می‌کنه):
  ```ts
  useEffect(() => {
    if (tab !== 'wallet' || walletBalance !== null) return;

    const loadWallet = async () => {
      setWalletLoading(true);
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { setWalletLoading(false); return; }

      const [{ data: profileRow }, { data: txRows }] = await Promise.all([
        (supabaseBrowser.from('profiles') as any)
          .select('wallet_balance_usd')
          .eq('id', user.id)
          .single(),
        (supabaseBrowser.from('wallet_transactions') as any)
          .select('id, type, amount_usd, balance_after_usd, note, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setWalletBalance(profileRow?.wallet_balance_usd ?? 0);
      setWalletTx(txRows ?? []);
      setWalletLoading(false);
    };

    loadWallet();
  }, [tab]);
  ```

- [x] **تسک ۱۹:** بخشِ نمایشیِ تب رو اضافه کن — یک کارتِ موجودی (بزرگ، رنگی، مثل کارتِ خلاصه‌ی سبدِ خرید در چک‌اوت) + یک دکمه‌ی «شارژ کیف‌پول» (که در فاز ۴ فعالش می‌کنیم) + لیستِ تاریخچه‌ی تراکنش‌ها زیرش (هر ردیف: نوع تراکنش با آیکون و رنگِ متفاوت برای `topup`/سبز، `order_payment`/قرمز، `admin_adjustment`/آبی، مبلغ، و تاریخ) — دقیقاً هم‌سبک با بلوک‌های تبِ «سفارش‌های من» که همین الان در همین فایل هست (کارت‌های سفید با border و rounded-2xl).

- [x] **تسک ۲۰:** اگه `walletLoading` باشه یک اسپینر نشون بده، و اگه `walletTx` خالی بود یک حالتِ خالیِ ساده («هنوز تراکنشی نداری») — دقیقاً مثل حالتِ خالیِ تبِ سفارش‌ها.

---

## فاز ۴ — فرانت‌اند: فرآیندِ شارژِ کیف‌پول

- [x] **تسک ۲۱:** داخلِ همون تبِ کیف‌پول، یک استیتِ مرحله (step) بساز تا بشه بینِ «نمایشِ موجودی»، «انتخابِ مبلغ»، «صفحه‌ی پرداختِ کریپتو» و «پیامِ پایانی» سوییچ کرد:
  ```ts
  type ChargeStep = 'idle' | 'choose_amount' | 'paying' | 'submitted';
  const [chargeStep, setChargeStep] = useState<ChargeStep>('idle');
  const [chargeCurrency, setChargeCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'SEK'>('USD');
  const [chargeAmount, setChargeAmount] = useState<number | ''>('');
  const [activeTopupId, setActiveTopupId] = useState<string | null>(null);
  const [chargeError, setChargeError] = useState('');
  ```

- [x] **تسک ۲۲:** UI انتخابِ مبلغ رو بساز: یک سوییچرِ ارز (دقیقاً مثل سوییچرِ ارزِ هدر — همون ۴ گزینه‌ی USD/EUR/GBP/SEK)، چند دکمه‌ی مبلغِ پیش‌فرض (مثلاً ۵۰ / ۱۰۰ / ۲۰۰ / ۵۰۰ به همون ارزِ انتخاب‌شده) و یک اینپوتِ عددیِ دستی برای مبلغِ دلخواه، به‌علاوه‌ی یک دکمه‌ی «ادامه» که اعتبارسنجی می‌کنه مبلغ حداقل ۱۰ باشه (برای جلوگیری از فاکتورهای بی‌مصرفِ خیلی کوچیک).

- [x] **تسک ۲۳:** تابعِ «ساختِ فاکتورِ شارژ» رو بنویس — چون کاربر حتماً لاگین‌کرده (تبِ کیف‌پول اصلاً برای مهمان قابل‌دیدن نیست)، مستقیم و بدونِ واسطه‌ی یک API Route، در جدولِ `wallet_topups` درج می‌کنیم (پالیسیِ insertِ فاز ۱ اجازه می‌ده)؛ نرخِ تبدیل رو از همون `rates` که `useStore` از قبل کش کرده می‌خونیم (دقیقاً همون منطقِ `convertPrice` در `lib/store.ts`، ولی برعکس — از ارزِ انتخابی به دلار):
  ```ts
  const handleStartCharge = async () => {
    setChargeError('');
    if (!chargeAmount || chargeAmount < 10) {
      setChargeError(t('wallet.min_amount_error'));
      return;
    }

    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    // rates[code] یعنی «۱ دلار معادل چند واحد از اون ارزه»؛ پس برای رفتن از
    // ارزِ انتخابی به دلار، باید بر همون نرخ تقسیم کرد (دقیقاً برعکسِ convertPrice)
    const rate = storeRates[chargeCurrency] || 1;
    const amountUsd = Math.round((chargeAmount / rate) * 100) / 100;

    const { data, error } = await (supabaseBrowser.from('wallet_topups') as any)
      .insert({
        user_id: user.id,
        requested_currency: chargeCurrency,
        requested_amount: chargeAmount,
        amount_usd: amountUsd,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error || !data) {
      setChargeError(t('wallet.create_error'));
      return;
    }

    setActiveTopupId(data.id);
    setChargeStep('paying');
  };
  ```
  (`storeRates` یعنی همون `rates` که از `useStore()` می‌گیری — دقیقاً همون هوکی که `Header.tsx` و `checkout/page.tsx` از قبل استفاده می‌کنن؛ در بالای کامپوننتِ پروفایل یک خط `const { rates: storeRates } = useStore();` اضافه کن.)

- [x] **تسک ۲۴:** کامپوننتِ جدیدِ `components/WalletTopupPayment.tsx` رو بساز — این کامپوننت تقریباً یک کپیِ تطبیق‌یافته از `components/CryptoPayment.tsx` است، با این تفاوت‌ها:
  - به‌جای گرفتنِ `orderId`، پراپ‌های `topupId`, `requestedAmount`, `requestedCurrency` و یک تابعِ `onDone()` رو می‌گیره.
  - چون کیف‌پول به `cart` ربطی نداره، مقدارِ «ارزشِ فیات» که نمایش می‌ده مستقیم از `requestedAmount`/`requestedCurrency` میاد (نه از `useStore().cart`).
  - به‌جای `/api/crypto/calc`، به `/api/wallet/topup/calc` با بدنه‌ی `{ topupId, symbol }` وصل می‌شه.
  - دکمه‌ی نهایی به‌جای `/api/orders/confirm`، `/api/wallet/topup/confirm` رو صدا می‌زنه (با هدرِ `Authorization` چون این روت لاگین می‌خواد — طبق تسک ۱۱).
  - به‌جای `router.push('/success?id=...')`، در پایان `onDone()` رو صدا می‌زنه (چون شارژِ کیف‌پول یک صفحه‌ی موفقیتِ جدا نداره — نتیجه‌اش همون‌جا، داخلِ تبِ کیف‌پول نشون داده می‌شه).
  - بقیه‌ی اسکلت (انتخابِ روش پرداخت از جدولِ `payment_methods`، باکسِ راهنمای محاسبه، دکمه‌ی «تازه‌سازیِ نرخ») عیناً همون چیزیه که در `CryptoPayment.tsx` هست — همون کامپوننت رو کپی کن و این چند مورد رو عوض کن.

- [x] **تسک ۲۵:** وقتی `chargeStep === 'paying'` است، همین کامپوننتِ جدید رو رندر کن:
  ```tsx
  {chargeStep === 'paying' && activeTopupId && (
    <WalletTopupPayment
      topupId={activeTopupId}
      requestedAmount={Number(chargeAmount)}
      requestedCurrency={chargeCurrency}
      onDone={() => setChargeStep('submitted')}
    />
  )}
  ```

- [x] **تسک ۲۶:** وقتی `chargeStep === 'submitted'` است، یک پیامِ موفقیتِ ساده نشون بده — دقیقاً هم‌لحن با پیامِ «چک کن ایمیلت رو» در فرمِ ثبت‌نام، ولی برای شارژِ کیف‌پول: «فاکتورت ثبت شد. اگر می‌خوای الان پرداخت کنی، روی دکمه‌ی واتساپِ پایینِ صفحه بزن تا آدرسِ ولت رو بگیری — دقیقاً همون کاری که موقعِ خرید از سایت انجام می‌دی.» (دکمه‌ی شناورِ واتساپ در `FloatingContact.tsx` از قبل روی همه‌ی صفحاتِ غیرِادمین هست، پس کارِ اضافه‌ای لازم نیست — فقط متن رو واضح بنویس که مشتری بدونه باید از همون دکمه استفاده کنه.) یک دکمه‌ی «بازگشت به کیف‌پول» هم بذار که `chargeStep` رو به `'idle'` و `walletBalance`/`walletTx` رو به `null` برگردونه تا با رفرشِ خودکار، موجودیِ تازه (اگه از قبل توسط ادمین شارژ شده باشه) دوباره خونده بشه.

---

## فاز ۵ — فرانت‌اند: پرداختِ سفارش با کیف‌پول در چک‌اوت

> فایل هدف: `app/[locale]/checkout/page.tsx`، دقیقاً همون مرحله‌ی ۲ (`step === 2`) که الان فقط `<CryptoPayment orderId={orderId} />` رو نشون می‌ده.

- [x] **تسک ۲۷:** داخلِ همون افکتی که `savedAddresses` و `profileInfo` رو می‌خونه (`loadUserData`)، یک کوئریِ سوم هم به `Promise.all` اضافه کن تا موجودیِ کیف‌پول هم همون لحظه خونده بشه:
  ```ts
  (supabaseBrowser.from('profiles') as any)
    .select('wallet_balance_usd')
    .eq('id', session.user.id)
    .single(),
  ```
  و یک استیتِ جدید تعریف کن: `const [walletBalance, setWalletBalance] = useState<number | null>(null);` که بعدِ خوندنِ نتیجه پر می‌شه.

- [x] **تسک ۲۸:** استیت‌های جدید برای انتخابِ روشِ پرداخت رو اضافه کن:
  ```ts
  const [paymentTab, setPaymentTab] = useState<'crypto' | 'wallet'>('crypto');
  const [payingWithWallet, setPayingWithWallet] = useState(false);
  const [walletPayError, setWalletPayError] = useState('');

  const canPayWithWallet = isLoggedIn && walletBalance !== null && walletBalance >= totalBaseUSD;
  ```

- [x] **تسک ۲۹:** در بالای بخشِ `step === 2`، درست قبل از رندرِ `<CryptoPayment ... />`، اگه `isLoggedIn` باشه یک سوییچرِ دو-تبی اضافه کن (دقیقاً هم‌الگو با تب‌های «ورود»/«ثبت‌نام» در صفحه‌ی لاگین): یک تب «پرداخت با کریپتو» و یک تب «پرداخت با کیف‌پول». اگه `canPayWithWallet` فالس باشه، تبِ کیف‌پول رو غیرفعال (خاکستری، غیرقابل‌کلیک) نشون بده و کنارش بنویس «موجودی کافی نیست» + موجودیِ فعلی.

- [x] **تسک ۳۰:** وقتی `paymentTab === 'wallet'` است، به‌جای `<CryptoPayment />` یک کارتِ ساده نشون بده: مبلغِ سفارش، موجودیِ فعلیِ کیف‌پول، موجودیِ بعد از پرداخت، و یک دکمه‌ی «پرداخت و ثبت سفارش». تابعِ کلیکِ این دکمه:
  ```ts
  const handlePayWithWallet = async () => {
    setPayingWithWallet(true);
    setWalletPayError('');
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const res = await fetch('/api/wallet/pay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ orderId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t('errors.server_error'));

      localStorage.removeItem('pending_order_id');
      localStorage.removeItem('checkout_draft');
      router.push(`/success?id=${orderId}`);
    } catch (err: any) {
      setWalletPayError(err.message);
    } finally {
      setPayingWithWallet(false);
    }
  };
  ```
  (توجه کن که مقصدِ نهایی همون صفحه‌ی `/success` فعلیه — هیچ صفحه‌ی جدیدی برای این مسیر لازم نیست، دقیقاً همون تجربه‌ای که بعد از پرداختِ کریپتو هم می‌بینه.)

---

## فاز ۶ — اعلان‌ها (Notification Bell)

- [x] **تسک ۳۱:** کامپوننتِ جدیدِ `components/NotificationBell.tsx` رو بساز — یک آیکونِ زنگوله با شمارنده‌ی نخوانده‌ها که با کلیک، یک دراپ‌داونِ کوچیک از آخرین نوتیف‌ها باز می‌کنه:
  ```tsx
  'use client';
  import { useEffect, useState, useRef } from 'react';
  import { Bell } from 'lucide-react';
  import { supabaseBrowser } from '@/lib/supabase-browser';
  import { useTranslations } from 'next-intl';

  interface Notif {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }

  export default function NotificationBell() {
    const t = useTranslations('Notifications');
    const [items, setItems] = useState<Notif[]>([]);
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    const unreadCount = items.filter((n) => !n.is_read).length;

    const load = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;
      const { data } = await (supabaseBrowser.from('notifications') as any)
        .select('id, title, message, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setItems(data);
    };

    useEffect(() => {
      load();
      const interval = setInterval(load, 60000); // هر ۶۰ ثانیه یک‌بار چک کن
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
      const unread = items.filter((n) => !n.is_read);
      if (unread.length === 0) return;
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await (supabaseBrowser.from('notifications') as any)
        .update({ is_read: true })
        .in('id', unread.map((n) => n.id));
    };

    return (
      <div className="relative" ref={boxRef}>
        <button
          onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
          aria-label={t('aria_label')}
          className="relative p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100"
        >
          <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute end-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 font-[family-name:var(--font-vazir)]">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('empty')}</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={`p-3 border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                  <p className="text-sm font-bold text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
  ```
  (نکته درباره‌ی «۶۰ ثانیه یک‌بار چک کن»: این ساده‌ترین راهه و پروژه از قبل هیچ‌جا از Supabase Realtime استفاده نمی‌کنه، پس برای هماهنگی با بقیه‌ی کدبیس همین روشِ polling رو نگه داشتم. اگه بعداً خواستی آنی‌تر بشه، می‌شه با `supabaseBrowser.channel(...)` به Realtime مهاجرت کرد — ولی فعلاً لازم نیست.)

- [x] **تسک ۳۲:** در `components/Header.tsx`، داخلِ بخشِ Actions، درست کنارِ دکمه‌ی پروفایل (همون‌جایی که `{isAuthed ? <Link href="/profile">...` هست)، اگه `isAuthed` باشه زنگوله رو هم رندر کن:
  ```tsx
  {isAuthed && <NotificationBell />}
  ```
  (و بالای فایل: `import NotificationBell from '@/components/NotificationBell';`)

- [x] **تسک ۳۳:** در `components/MobileBottomNav.tsx`، همون بلوکی که `isAuthed ? <Link href="/profile">...` رو نشون می‌ده (نزدیکِ خطِ ۱۹۰) را در یک ردیفِ فلکس بپیچ و زنگوله رو کنارش (نه داخلش، چون آن خودش یک `<Link>` است) اضافه کن:
  ```tsx
  {isAuthed ? (
    <div className="flex items-center gap-2 mb-3">
      <Link
        href="/profile"
        onClick={() => setIsMenuOpen(false)}
        className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-blue-700 active:bg-blue-100 transition-colors"
      >
        <User className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-bold">{tHeader('profile_aria')}</span>
      </Link>
      <NotificationBell />
    </div>
  ) : (
    // ... دکمه‌ی ورود، بدون تغییر
  )}
  ```
  (و همون importِ `NotificationBell` رو بالای این فایل هم اضافه کن.)

---

## فاز ۷ — پنل ادمین

- [x] **تسک ۳۴:** فایل جدید `app/admin/wallet-topups/page.tsx` رو بساز — یک جدول دقیقاً هم‌سبک با `app/admin/orders/page.tsx` (همون هدر، همون input جستجو، همون ساختارِ `<table>`)، با ستون‌های: مشتری (نام+ایمیل)، مبلغِ درخواستی (ارز+عدد)، معادلِ دلاری، روشِ پرداختِ کریپتوِ انتخابی، وضعیت (با همون رنگ‌بندیِ `pending`=زرد / `paid`=سبز / `cancelled`=قرمز که در `admin/orders/page.tsx` هست)، تاریخ، و عملیات.

- [x] **تسک ۳۵:** دو دکمه‌ی عملیات برای هر ردیفِ `pending`: «تایید و شارژ کن» (سبز) و «لغو» (قرمز). هر دو یک تابعِ مشترک صدا می‌زنن:
  ```ts
  const handleStatusChange = async (id: string, status: 'paid' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/wallet-topups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await fetchTopups();
    } catch (err: any) {
      alert('خطا: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };
  ```
  برای دکمه‌ی «تایید و شارژ کن»، قبل از فراخوانی حتماً یک `window.confirm('مطمئنی؟ این فاکتور واقعاً همین مشتریه که پیامش رو گرفتی؟')` بذار — همون لایه‌ی محافظِ اضافه‌ای که برای نگرانیِ خودت (اشتباه گرفتنِ فاکتورِ یک مشتری با مشتریِ دیگه) کمک می‌کنه.

- [x] **تسک ۳۶:** در `components/AdminWrapper.tsx`، یک آیتمِ منویِ جدید اضافه کن (بعدِ «کاربران»، قبلِ «محصولات» منطقیه):
  ```ts
  { name: 'کیف‌پول مشتریان', href: '/admin/wallet-topups', icon: PiggyBank },
  ```
  (آیکونِ `Wallet` همین الان برای «درگاه پرداخت» استفاده شده، برای جلوگیری از تکرار از `PiggyBank` استفاده کن؛ اونو هم به importِ lucide-react بالای فایل اضافه کن.)

- [x] **تسک ۳۷:** در `interface AdminUser` در `app/admin/users/page.tsx` یک فیلدِ جدید اضافه کن: `wallet_balance_usd: number;` و یک ستونِ جدید «موجودی کیف‌پول» به جدول اضافه کن. در `app/api/admin/users/route.ts`، کوئریِ پروفایل‌ها رو طوری عوض کن که این ستون رو هم بخونه (دقیقاً همون تغییری که تسکِ ۳۶ سندِ ایمیل برای ستونِ `provider` انجام داد).

- [x] **تسک ۳۸:** کنارِ همون ستون، یک دکمه‌ی کوچیکِ «تنظیم دستی» بذار که یک مودالِ ساده باز می‌کنه: یک اینپوتِ عددی (مثبت = افزایش، منفی = کاهش) + یک اینپوتِ توضیح (اختیاری) + دکمه‌ی «ثبت» که `/api/admin/wallet-adjust` رو با `{ userId, amountUsd, note }` صدا می‌زنه و بعدِ موفقیت لیستِ کاربران رو دوباره می‌خونه.

---

## فاز ۸ — متن‌ها (i18n)

- [x] **تسک ۳۹:** توی `messages/fa.json`، namespace جدید `Wallet` رو اضافه کن (کنارِ `Auth`، `Profile` و بقیه‌ی namespace های هم‌سطح): کلیدهایی مثل `balance_title`, `charge_button`, `choose_currency`, `choose_amount`, `custom_amount_ph`, `min_amount_error`, `create_error`, `continue_button`, `history_title`, `history_empty`, `tx_type_topup`, `tx_type_order_payment`, `tx_type_admin_adjustment`, `submitted_title`, `submitted_desc`, `back_to_wallet`, `pay_with_crypto_tab`, `pay_with_wallet_tab`, `insufficient_balance`, `current_balance`, `balance_after_payment`, `pay_and_submit_button`. همچنین کلیدِ `"wallet": "کیف‌پول"` رو داخلِ `Profile.tabs` اضافه کن (کنارِ `account`/`addresses`/`orders`).
  > **به‌روزرسانی (طبقِ نکته‌ی معماریِ ۸):** کدِ `profile/page.tsx` و `checkout/page.tsx` از همین الان با `const tWallet = useTranslations('Wallet');` به این namespace وصل شدن (به‌جای اینکه زیرِ `Profile` یا `Checkout` تعریف بشه) — پس وقتی این تسک رو انجام می‌دی، کلیدها رو دقیقاً با همین نام‌ها (بدون پیشوند اضافه) زیرِ یک آبجکتِ `"Wallet"` در ریشه‌ی fa.json/en.json بذار.

- [x] **تسک ۴۰:** namespace جدید `Notifications` رو هم اضافه کن: `aria_label`, `empty`.

- [x] **تسک ۴۱:** دقیقاً همین کلیدها (با معادلِ انگلیسیِ درست) رو توی `messages/en.json` هم اضافه کن — همون namespace ها، همون ساختار.

---

## فاز ۹ — تست کامل (قبل از دیپلوی نهایی)

> ⚠️ **نکته‌ی مهم:** درست مثلِ فازِ تستِ سندِ ایمیل، این تسک‌ها «تسکِ کدنویسی» نیستن — تست‌های دستی‌ان که باید خودِ بهادر روی سایتِ واقعی انجام بده. دستیار به این‌ها دسترسی نداره.

- [ ] **تسک ۴۲:** ثبت‌نامِ یک کاربرِ تستی → رفتن به تبِ کیف‌پول → موجودی باید `$0` نشون بده.
- [ ] **تسک ۴۳:** شارژِ کیف‌پول با ارزِ EUR → دیدنِ کامپوننتِ پرداختِ کریپتو → زدنِ «من پرداخت کردم» → پیامِ تلگرام باید برسه.
- [ ] **تسک ۴۴:** از پنل ادمین، همون فاکتورِ شارژ رو «تایید و شارژ کن» → موجودیِ کاربر در تبِ کیف‌پول (بعدِ رفرش) باید دقیقاً معادلِ دلاریِ همون مبلغِ یورو افزایش پیدا کرده باشه.
- [ ] **تسک ۴۵:** بلافاصله بعدِ تاییدِ ادمین، زنگوله‌ی نوتیف (هم در هدر دسکتاپ، هم در منوی موبایل) باید یک عدد نشون بده و با بازکردنش، پیامِ «کیف‌پولت شارژ شد» دیده بشه.
- [ ] **تسک ۴۶:** روی همون فاکتورِ شارژ، دوباره «تایید و شارژ کن» رو بزن (برای شبیه‌سازیِ کلیکِ تصادفیِ دوباره) → باید پیامِ خطای «قبلاً پردازش شده» بیاد و موجودی *دوباره* اضافه نشه.
- [ ] **تسک ۴۷:** یک سبدِ خرید ببند (کمتر از موجودیِ کیف‌پول) → در چک‌اوت، تبِ «پرداخت با کیف‌پول» باید فعال باشه → پرداخت رو بزن → باید فوراً (بدونِ نیاز به تاییدِ ادمین) به صفحه‌ی موفقیت بری و در پنل ادمین سفارش با وضعیتِ `paid` دیده بشه.
- [ ] **تسک ۴۸:** یک سبدِ خریدِ بزرگ‌تر از موجودیِ کیف‌پول ببند → در چک‌اوت، تبِ «پرداخت با کیف‌پول» باید غیرفعال و پیامِ «موجودی کافی نیست» دیده بشه.
- [ ] **تسک ۴۹:** از پنل ادمین، دکمه‌ی «تنظیم دستی» رو روی یک کاربر امتحان کن (مثلاً `-5+‬` دلار) و مطمئن شو هم موجودی درست تغییر می‌کنه، هم یک ردیفِ جدید در تاریخچه‌ی تراکنش‌های همون کاربر دیده می‌شه.
- [ ] **تسک ۵۰:** مطمئن شو یک کاربرِ عادی (نه ادمین) نمی‌تونه با درخواستِ مستقیم به سوپابیس (مثلاً از کنسولِ مرورگر) مقدارِ `wallet_balance_usd` یا `is_admin` خودش رو تغییر بده (باید خطای permission بگیره — طبقِ تسکِ ۶ در فازِ ۱).

---

## فاز ۱۰ — نکات برای آینده (اختیاری، تسک نیست)

- **تشخیصِ خودکارِ پرداختِ آن‌چین:** الان هم برای سفارش‌ها و هم برای شارژِ کیف‌پول، تاییدِ نهایی دستیه (ادمین باید تراکنشِ بلاکچین رو خودش چک کنه). اگه در آینده خواستی این بخش رو با یک وب‌هوک یا سرویسِ رصدِ بلاکچین خودکار کنی، همین تابعِ `credit_wallet_topup` قابلِ فراخوانی از یک روتِ webhook هم هست — فقط باید منبعِ فراخوانی عوض بشه، نه خودِ منطق.
- **تبدیلِ موجودی بینِ ارزها:** چون موجودی زیرِ پوسته دلاریه، اگه بعداً خواستی مستقیماً موجودی رو با یک ارزِ ثابت (نه دلار) نمایش بدی، کارِ زیادی لازم نیست — فقط کافیه در نمایش از `convertPrice` همون `useStore` استفاده کنی (که همین الان هم برای همه‌جای سایت استفاده می‌شه).
- **استردادِ خودکارِ وجه برای سفارش‌های لغوشده:** الان اگه یک سفارشِ پرداخت‌شده با کیف‌پول لغو بشه، پول خودکار برنمی‌گرده. برای این کار می‌شه یک تابعِ RPC مشابهِ `admin_adjust_wallet` ولی مخصوصِ استرداد ساخت که هم موجودی رو برمی‌گردونه هم `related_order_id` رو ثبت می‌کنه — فعلاً چون حجمِ لغوها کمه، تسکِ ۳۸ (تنظیمِ دستی) برای این مورد کافیه.

---

### خلاصه‌ی نقطه‌ی پایان
وقتی همه‌ی فازهای ۱ تا ۹ تیک خوردن، یعنی: مشتری در پنلِ کاربری‌اش کیف‌پول داره، می‌تونه با هر ارزی که دلش می‌خواد شارژش کنه (با همون تجربه‌ی آشنای فاکتور+کریپتو+واتساپِ چک‌اوتِ فعلی)، بعدِ تاییدِ ادمین یک نوتیفِ داخل‌سایتی می‌گیره (بدونِ ریسکِ ایمیلِ اشتباه)، و از همون لحظه می‌تونه سرِ چک‌اوت به‌جای کریپتو مستقیم با موجودیِ کیف‌پولش سفارش ثبت کنه — بدونِ فرستادنِ حتی یک پیام.