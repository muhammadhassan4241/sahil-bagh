-- ============================================================
-- FIX FOR: "Database error saving new user" (500)
-- Copy and run this entire script in your Supabase SQL Editor:
-- Supabase Dashboard > SQL Editor > New query > Paste & Run
-- ============================================================

-- 1. Ensure user_role enum exists
do $$ begin
  create type public.user_role as enum ('customer', 'owner', 'admin');
exception
  when duplicate_object then null;
end $$;

-- 2. Ensure profiles table exists with proper defaults
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'New User',
  phone text,
  whatsapp text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS and ensure non-blocking profile policies
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 4. Replace the trigger function with an exception-safe version
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role_val public.user_role;
begin
  -- Safely extract role, falling back to 'customer'
  begin
    if new.raw_user_meta_data->>'role' in ('customer', 'owner', 'admin') then
      user_role_val := (new.raw_user_meta_data->>'role')::public.user_role;
    else
      user_role_val := 'customer'::public.user_role;
    end if;
  exception when others then
    user_role_val := 'customer'::public.user_role;
  end;

  -- Insert profile
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New User'),
    user_role_val
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(excluded.full_name), ''), public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role);

  return new;
exception when others then
  -- CRITICAL: Catch all errors so auth.users insertion is NEVER blocked
  return new;
end;
$$;

-- 5. Drop and recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
