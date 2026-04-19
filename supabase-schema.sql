-- ============================================================
-- AROGYA — Supabase Database Schema
-- Run this entire script in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with health data
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text,
  dob               date,
  gender            text default 'Male',
  blood             text default 'O+',
  weight            text,
  height            text,
  bmi               text,
  city              text,
  phone             text,
  conditions        text[] default '{}',
  allergies         text[] default '{}',
  medications_static text[] default '{}',
  vaccinations       text[] default '{}',
  emergency_contact text,
  doctor            text,
  insurance         text,
  last_checkup      text,
  issued            date,
  expiry            date,
  created_at        timestamptz default now()
);

-- Row Level Security for profiles
alter table public.profiles enable row level security;

-- Cleanup existing policies to avoid "already exists" errors
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Public can view profiles if they know the UUID" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public can view profiles if they know the UUID"
  on public.profiles for select
  using (true);

-- 2. MEDICATIONS TABLE
create table if not exists public.medications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  name        text not null,
  dose        text,
  time        text,
  freq        text default 'Daily',
  notes       text,
  taken_today boolean default false,
  color       text default '#dbeafe',
  created_at  timestamptz default now()
);

alter table public.medications enable row level security;

drop policy if exists "Users manage own medications" on public.medications;

create policy "Users manage own medications"
  on public.medications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 3. MOOD LOGS TABLE
create table if not exists public.mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  score       integer check (score between 1 and 10),
  mood_name   text,
  mood_emoji  text,
  note        text,
  logged_at   timestamptz default now()
);

-- Ensure columns exist if table was created previously
alter table public.mood_logs add column if not exists mood_name text;
alter table public.mood_logs add column if not exists mood_emoji text;

alter table public.mood_logs enable row level security;

drop policy if exists "Users manage own mood logs" on public.mood_logs;

create policy "Users manage own mood logs"
  on public.mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 4. HEALTH REPORTS TABLE
create table if not exists public.health_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  name         text not null,
  type         text default 'Other',
  status       text default 'Pending',
  file_url     text,
  storage_path text,
  date         date,
  created_at   timestamptz default now()
);

-- Ensure storage_path exists if table was created previously
alter table public.health_reports add column if not exists storage_path text;

alter table public.health_reports enable row level security;

drop policy if exists "Users manage own reports" on public.health_reports;

create policy "Users manage own reports"
  on public.health_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 5. BLOOD DONORS TABLE (public — anyone can read)
create table if not exists public.blood_donors (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id),
  name         text not null,
  blood        text not null,
  city         text,
  phone        text,
  last_donated text default 'Recently',
  available    boolean default true,
  created_at   timestamptz default now()
);

alter table public.blood_donors enable row level security;

drop policy if exists "Public can view donors" on public.blood_donors;
drop policy if exists "Users can register as donor" on public.blood_donors;
drop policy if exists "Users can update own donor record" on public.blood_donors;

-- Anyone can read donors
create policy "Public can view donors"
  on public.blood_donors for select
  using (true);

-- Only authenticated users can insert/update their own donor record
create policy "Users can register as donor"
  on public.blood_donors for insert
  with check (auth.uid() = user_id);

create policy "Users can update own donor record"
  on public.blood_donors for update
  using (auth.uid() = user_id);


-- 6. BLOOD REQUESTS TABLE (urgent requests)
create table if not exists public.blood_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  phone        text,
  blood        text,
  city         text,
  requested_at timestamptz default now()
);

alter table public.blood_requests enable row level security;

drop policy if exists "Public can submit blood requests" on public.blood_requests;

-- Anyone can insert a request
create policy "Public can submit blood requests"
  on public.blood_requests for insert
  with check (true);


-- ============================================================
-- STORAGE BUCKET for health report files
-- Run this in SQL Editor OR manually create in Storage tab:
-- Bucket name: "health_reports" — set to public
-- ============================================================

insert into storage.buckets (id, name, public)
values ('health_reports', 'health_reports', true)
on conflict (id) do nothing;

drop policy if exists "Users upload to own folder" on storage.objects;
drop policy if exists "Public read health reports" on storage.objects;

create policy "Users upload to own folder"
  on storage.objects for insert
  with check (bucket_id = 'health_reports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read health reports"
  on storage.objects for select
  using (bucket_id = 'health_reports');


-- ============================================================
-- SEED BLOOD DONORS (Unique Registry)
-- ============================================================

-- Clean up previous seed data (only records without a user_id) to prevent duplicates
delete from public.blood_donors where user_id is null;

insert into public.blood_donors (name, blood, city, phone, last_donated, available) values
  ('Priya Verma',    'O+',  'Lucknow',     '+91 98001 11111', '2 months ago', true),
  ('Rahul Singh',    'A+',  'Kanpur',      '+91 97002 22222', '3 months ago', true),
  ('Meena Gupta',    'B+',  'Jhansi',      '+91 96003 33333', '6 months ago', false),
  ('Suresh Kumar',   'AB+', 'Agra',        '+91 95004 44444', '1 month ago',  true),
  ('Kavya Nair',     'O-',  'Kochi',       '+91 94005 55555', '4 months ago', true),
  ('Amit Patel',     'A-',  'Ahmedabad',   '+91 93006 66666', '5 months ago', false),
  ('Neha Joshi',     'B-',  'Nainital',    '+91 92007 77777', '2 months ago', true),
  ('Arjun Reddy',    'O+',  'Hyderabad',   '+91 91008 88888', '1 month ago',  true),
  ('Sneha Kulkarni', 'B+',  'Mumbai',      '+91 90009 99999', 'Recent',       true),
  ('Ananya Iyer',    'A-',  'Chennai',     '+91 89010 00000', '5 months ago', true),
  ('Vikram Malhotra','AB-', 'Delhi',       '+91 88011 11111', '2 months ago', true),
  ('Rohan Deshmukh', 'O-',  'Pune',        '+91 87012 22222', '1 year ago',   false),
  ('Ishani Bose',    'B-',  'Kolkata',     '+91 86013 33333', '3 months ago', true),
  ('Aditya Sharma',  'O+',  'Bangalore',   '+91 85014 44444', 'Recent',       true),
  ('Zoya Khan',      'A+',  'Bhopal',      '+91 84015 55555', '4 months ago', true),
  ('Deepak Gill',    'B+',  'Chandigarh',  '+91 83016 66666', '2 months ago', true),
  ('Tanvi Rao',      'O-',  'Mangalore',   '+91 82017 77777', '6 months ago', true),
  ('Rajesh Gada',    'AB+', 'Surat',       '+91 81018 88888', '1 month ago',  true),
  ('Siddharth Das',  'A-',  'Guwahati',    '+91 80019 99999', 'Recent',       true),
  ('Meher Wan',      'B-',  'Srinagar',    '+91 79020 00000', '4 months ago', true);
