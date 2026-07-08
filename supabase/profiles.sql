-- =====================================================================
-- Soughat Shop — Customer Profiles (Google OAuth via Supabase Auth)
-- ---------------------------------------------------------------------
-- Run this SQL in your Supabase dashboard:
--   SQL Editor  →  New query  →  paste everything below  →  Run
-- =====================================================================

-- 1) PROFILES TABLE ----------------------------------------------------
-- Linked 1:1 to auth.users via Foreign Key on `id`.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- 2) TRIGGER FUNCTION ---------------------------------------------------
-- Fires on every new row in auth.users (i.e. Google sign-up / first login)
-- and copies the Google metadata into public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;   -- idempotent: never duplicate
  return new;
end;
$$;

-- 3) TRIGGER ------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) ROW LEVEL SECURITY (RLS) ------------------------------------------
alter table public.profiles enable row level security;

-- Users can READ only their own profile
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can UPDATE only their own profile
drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- (Optional) allow the inserting trigger (SECURITY DEFINER) to write.
-- Not strictly required because the function runs as definer, but keeps
-- intent explicit. Uncomment if you prefer deny-by-default clarity:
-- drop policy if exists "Service role can insert" on public.profiles;
-- create policy "Service role can insert"
--   on public.profiles for insert
--   with check (true);


alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists phone text,
  add column if not exists country text;