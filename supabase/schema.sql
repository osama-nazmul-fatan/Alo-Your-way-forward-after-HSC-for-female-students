-- =========================================================
-- Alo — Supabase schema
-- Run this whole file once in Supabase: SQL Editor -> New query -> Run
-- =========================================================

-- ---------- Profiles (one row per registered user) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  district      text,
  hsc_year      int,
  hsc_group     text,          -- science / humanities / business
  gpa           numeric(3,2),
  needs_income  boolean default false,
  has_computer  boolean default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- Interests (which program each user saved) ----------
create table if not exists public.interests (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  program_id  text not null,
  status      text not null default 'new',  -- new / contacted / applied / enrolled
  created_at  timestamptz not null default now(),
  unique (user_id, program_id)
);

-- ---------- Messages (one conversation per user, with the counselling team) ----------
create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade, -- whose conversation
  sender_id   uuid not null references public.profiles(id) on delete cascade, -- who wrote it
  body        text not null check (char_length(body) between 1 and 2000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists messages_user_idx on public.messages(user_id, created_at);

-- ---------- Helper: is the current user an admin? ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- Create a profile automatically on sign-up ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, district)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'district'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles  enable row level security;
alter table public.interests enable row level security;
alter table public.messages  enable row level security;

-- Profiles: users see/edit their own; admins see all
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Users may NOT change is_admin or email themselves: only these columns are editable
revoke update on public.profiles from authenticated, anon;
grant  update (full_name, phone, district, hsc_year, hsc_group, gpa, needs_income, has_computer)
  on public.profiles to authenticated;

-- Interests: users manage their own; admins read all and update status
drop policy if exists "interests read"   on public.interests;
drop policy if exists "interests insert" on public.interests;
drop policy if exists "interests delete" on public.interests;
drop policy if exists "interests admin update" on public.interests;
create policy "interests read"   on public.interests for select using (user_id = auth.uid() or public.is_admin());
create policy "interests insert" on public.interests for insert with check (user_id = auth.uid());
create policy "interests delete" on public.interests for delete using (user_id = auth.uid());
create policy "interests admin update" on public.interests for update using (public.is_admin()) with check (public.is_admin());
revoke update on public.interests from authenticated, anon;
grant  update (status) on public.interests to authenticated;

-- Messages: a user reads/writes only her own conversation; admins read/write all
drop policy if exists "messages read"   on public.messages;
drop policy if exists "messages insert" on public.messages;
drop policy if exists "messages mark read" on public.messages;
create policy "messages read" on public.messages for select
  using (user_id = auth.uid() or public.is_admin());
create policy "messages insert" on public.messages for insert
  with check (sender_id = auth.uid() and (user_id = auth.uid() or public.is_admin()));
create policy "messages mark read" on public.messages for update
  using (user_id = auth.uid() or public.is_admin());
revoke update on public.messages from authenticated, anon;
grant  update (is_read) on public.messages to authenticated;

-- ---------- Live chat: stream new messages ----------
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

-- =========================================================
-- AFTER you create your own account on the website, make yourself admin:
--   update public.profiles set is_admin = true where email = 'you@example.com';
-- =========================================================
