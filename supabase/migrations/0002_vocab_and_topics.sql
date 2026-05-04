-- Vocab cards (spaced repetition, SM-2)
create table if not exists public.vocab_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  de text not null,
  ca text not null,
  example text,
  ease_factor numeric not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  due_date date not null default current_date,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, de)
);

create index if not exists vocab_cards_due_idx
  on public.vocab_cards (user_id, due_date);

alter table public.vocab_cards enable row level security;

create policy "vocab_cards_self" on public.vocab_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Topics: ja hi havia la columna `topics` a profiles. Afegim catàleg per la UI.
-- (No necessitem taula nova; la UI farà servir un array fix de temes disponibles.)
