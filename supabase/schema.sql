-- Schema for the Aleman language-learning app.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  level cefr_level,
  level_assessed_at timestamptz,
  topics text[] default array['allgemein']::text[],
  created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  score numeric not null,
  level cefr_level not null,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_date date not null,
  level cefr_level not null,
  topic text not null,
  title text not null,
  text_de text not null,
  translation_ca text not null,
  vocab jsonb not null,
  questions jsonb not null,
  audio_path text,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_date)
);

create table public.lesson_progress (
  lesson_id uuid primary key references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  listened boolean not null default false,
  answers jsonb,
  score numeric,
  completed_at timestamptz
);

create index lessons_user_date_idx on public.lessons (user_id, lesson_date desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "assessments_self" on public.assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lessons_self" on public.lessons
  for select using (auth.uid() = user_id);

create policy "lesson_progress_self" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for the generated MP3s.
insert into storage.buckets (id, name, public)
values ('lesson-audio', 'lesson-audio', false)
on conflict (id) do nothing;

create policy "audio_owner_read" on storage.objects
  for select using (
    bucket_id = 'lesson-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
