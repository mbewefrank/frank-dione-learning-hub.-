-- FRANK DIONE LEARNING HUB
-- Database setup for Supabase

create extension if not exists pgcrypto;


-- ==========================================
-- PROFILES
-- ==========================================

create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text,

  student_number text,

  institution text,

  plan text not null default 'free'
    check (plan in ('free', 'premium')),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ==========================================
-- DOCUMENTS
-- ==========================================

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  description text,

  course text,

  storage_path text not null unique,

  access_level text not null default 'free'
    check (access_level in ('free', 'premium')),

  published boolean not null default false,

  created_at timestamptz not null default now()
);


-- ==========================================
-- SUBSCRIPTIONS
-- ==========================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  plan text not null
    check (plan in ('free', 'premium')),

  status text not null default 'inactive'
    check (
      status in (
        'inactive',
        'pending',
        'active',
        'cancelled',
        'expired'
      )
    ),

  provider text,

  provider_reference text,

  starts_at timestamptz,

  ends_at timestamptz,

  created_at timestamptz not null default now()
);


-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.profiles
enable row level security;

alter table public.documents
enable row level security;

alter table public.subscriptions
enable row level security;


-- ==========================================
-- PROFILE POLICIES
-- ==========================================

drop policy if exists
"profiles_select_own"
on public.profiles;

create policy
"profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);


drop policy if exists
"profiles_insert_own"
on public.profiles;

create policy
"profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);


drop policy if exists
"profiles_update_own"
on public.profiles;

create policy
"profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- ==========================================
-- DOCUMENT POLICIES
-- ==========================================

drop policy if exists
"documents_select_published"
on public.documents;

create policy
"documents_select_published"
on public.documents
for select
to authenticated
using (published = true);


-- ==========================================
-- SUBSCRIPTION POLICIES
-- ==========================================

drop policy if exists
"subscriptions_select_own"
on public.subscriptions;

create policy
"subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);


-- ==========================================
-- AUTOMATIC PROFILE CREATION
-- ==========================================

create or replace function
public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$

begin

  insert into public.profiles (
    id,
    full_name
  )

  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      ''
    )
  );

  return new;

end;

$$;


drop trigger if exists
on_auth_user_created
on auth.users;


create trigger
on_auth_user_created

after insert
on auth.users

for each row

execute procedure
public.handle_new_user();


-- ==========================================
-- PRIVATE STORAGE BUCKET
-- ==========================================

insert into storage.buckets (
  id,
  name,
  public
)

values (
  'learning-documents',
  'learning-documents',
  false
)

on conflict (id)
do update set public = false;


-- ==========================================
-- STORAGE ACCESS
-- ==========================================

drop policy if exists
"learning_documents_read_authenticated"
on storage.objects;


create policy
"learning_documents_read_authenticated"

on storage.objects

for select

to authenticated

using (
  bucket_id = 'learning-documents'
);


-- ==========================================
-- IMPORTANT
-- ==========================================

-- Upload learning documents through
-- Supabase Storage.

-- Never put a Supabase service-role
-- or secret key in browser JavaScript.

-- Mobile Money/payment verification must
-- eventually be handled server-side.
