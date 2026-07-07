# Google OAuth Login — Complete Setup Guide (Soughat Shop)

This guide explains **exactly** how to wire up "Sign Up / Log In with Google"
for the Soughat Shop Next.js app (Supabase + Vercel). Follow it click-by-click.

The code is **already added** to the project. You only need to do the
dashboard/console configuration below and set the environment variables.

---

## 1. Supabase Project — Get Your Keys

1. Go to **https://supabase.com/dashboard** and open your project
   (the one Soughat Shop already uses).
2. In the left sidebar go to **Project Settings → API**.
3. Copy these two values — you will need them later:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    (These should already exist in your project; if not, add them — see Vercel section.)

---

## 2. Google Cloud Console — Create OAuth Credentials

### 2.1 Create a Google Cloud project (if you don't have one)
1. Go to **https://console.cloud.google.com/**.
2. Top bar → click the project dropdown → **New Project**.
3. Name it e.g. `soughat-shop`, click **Create**.

### 2.2 Configure the OAuth Consent Screen
1. In the left menu → **APIs & Services → OAuth consent screen**.
2. User type → **External** → Create.
3. Fill in:
   - **App name:** `Soughat Shop`
   - **User support email:** your email
   - **Developer contact email:** your email
4. Scroll down → **Save and Continue**.
5. **Scopes:** leave default (or add `.../auth/userinfo.email` & `.../auth/userinfo.profile` if prompted). Continue.
6. **Test users:** add your own Gmail address (required while app is in "Testing" mode). Continue → **Save**.

### 2.3 Create the OAuth Client ID
1. Left menu → **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Application type → **Web application**.
4. Name: `Soughat Shop Web`.
5. **Authorized JavaScript origins** — add BOTH:
   - `https://soughat.shop`
   - `http://localhost:3000`   (for local testing)
6. **Authorized redirect URIs** — add BOTH (this is critical):
   - `https://soughat.shop/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret** shown.

> Note: Supabase hosts the real OAuth endpoint at `/auth/v1/callback`.
> The `/fa/auth/callback` and `/en/auth/callback` pages in our app only
> exchange the `code` for a session after Google talks to Supabase.

---

## 3. Connect Google to Supabase

1. In Supabase dashboard → **Authentication → Sign In / Providers**.
2. Find **Google** in the list and click it.
3. Toggle **Enable sign in with Google** → ON.
4. Paste:
   - **Client ID** (from step 2.3)
   - **Client Secret** (from step 2.3)
5. **Redirect URL** should already show `https://YOUR-PROJECT.supabase.co/auth/v1/callback` — leave it.
6. Click **Save**.

That's it for the backend. Google login now works through Supabase.

---

## 3.5 ⚠️ CRITICAL — Supabase Auth → URL Configuration (the part that breaks live redirects)

This is the **most common cause** of "after Google login I land on
`http://localhost:3000/?code=...` instead of the profile/dashboard page" on the
live site. It happens when Supabase does **not** recognise the callback URL the
app sends, so it falls back to the **Site URL** (which is often still set to
`http://localhost:3000` from local development).

### 3.5.1 Set the Site URL

1. In the Supabase dashboard → **Authentication → URL Configuration**.
2. **Site URL** → set it to the live origin (no trailing slash):
   ```
   https://soughat.shop
   ```
   (Keep `http://localhost:3000` only if you also test locally; prefer setting it
   to the live URL in production.)

### 3.5.2 Add the locale callback URLs to "Redirect URLs"

1. Still in **Authentication → URL Configuration**.
2. Under **Redirect URLs**, add **both** locale-prefixed callbacks the app sends
   (the app passes `https://soughat.shop/<locale>/auth/callback` as `redirectTo`):
   ```
   https://soughat.shop/fa/auth/callback
   https://soughat.shop/en/auth/callback
   ```
   - For local testing also add `http://localhost:3000/fa/auth/callback` and
     `http://localhost:3000/en/auth/callback`.
   - Alternatively you may use the wildcard form (Supabase supports `*`) to
     cover both languages at once:
     ```
     https://soughat.shop/*/auth/callback
     ```
3. Click **Save**.

> Why this matters: when the app calls `signInWithOAuth` it passes
> `redirectTo = https://soughat.shop/<locale>/auth/callback`. Supabase only
> forwards the browser there if that exact URL (or a matching wildcard) is in the
> **Redirect URLs** allowlist. If it is NOT listed, Supabase silently redirects to
> the **Site URL** instead — which is why you saw
> `http://localhost:3000/?code=...`. Once the entries above are saved, Google
> will return the user to `/fa/auth/callback` (or `/en/auth/callback`) where the
> session is exchanged and the user is sent to the dashboard.
>
> Note: there is also a global client-side safety net component
> (`components/AuthSessionHandler.tsx`, mounted in `app/[locale]/layout.tsx`)
> that catches a stray `?code=` on any page and finishes the login. But the
> proper fix is the URL Configuration above — the safety net cannot recover the
> PKCE verifier when Supabase bounces the user to a *different* origin
> (e.g. `localhost:3000`), because the verifier is stored on `soughat.shop`.

---

## 4. Vercel — Environment Variables

In your **Vercel dashboard → Project → Settings → Environment Variables**:
(add them for `Production`, `Preview`, and `Development` as needed)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the **anon public** key from Supabase API |
| `NEXT_PUBLIC_SITE_URL` | `https://soughat.shop` (optional, used for absolute links) |

- These are **public** (browser-exposed) variables — safe to be public.
- Vercel auto-redeploys on save. No secret key is needed for Google OAuth
  because Supabase handles the secret server-side.

If you test locally, create a file named **`.env.local`** in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Then run `npm run dev` and open `http://localhost:3000/fa/login`.

---

## 5. How It Works (Flow)

1. User visits `/fa/login` (or `/en/login`) and clicks **Continue with Google**.
2. `supabaseBrowser.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/fa/auth/callback' } })`
   redirects the browser to Google.
3. Google authenticates and redirects to
   `https://soughat.shop/auth/v1/callback?code=...` (handled by Supabase),
   which then forwards the user back to `/fa/auth/callback`.
4. `app/[locale]/auth/callback/page.tsx` calls
   `exchangeCodeForSession(window.location.href)` → creates the session.
5. User is redirected to `/fa/dashboard` (the placeholder Customer Dashboard).

---

## 6. Files Added / Modified

| File | Purpose |
|------|---------|
| `lib/supabase-browser.ts` | Browser Supabase client (PKCE flow) |
| `app/[locale]/login/page.tsx` | Login / Sign Up page with "Continue with Google" |
| `app/[locale]/auth/callback/page.tsx` | OAuth redirect handler |
| `app/[locale]/dashboard/page.tsx` | Placeholder Customer Dashboard |
| `messages/en.json` | English texts under `"Auth"` key |
| `messages/fa.json` | Persian texts under `"Auth"` key |

---

## 7. Linking the Login Page (Optional)

To let customers reach the login page, add a link anywhere, e.g. in
`components/Header.tsx` or the Footer. Example using the i18n Link:

```tsx
import { Link } from '@/i18n/navigation';
<Link href="/login" className="...">ورود / Login</Link>
```

The route is locale-aware, so `/login` becomes `/fa/login` or `/en/login`
automatically.

---

## 8. Troubleshooting

- **`redirect_uri_mismatch` from Google:** Double-check the two Redirect URIs
  in Google Cloud exactly match `https://soughat.shop/auth/v1/callback`
  (and localhost for dev).
- **Login loops back to /login:** Make sure `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set on Vercel and match your project.
- **"Access blocked" from Google:** Add your Gmail under **OAuth consent
  screen → Test users** (while the app is in Testing mode).