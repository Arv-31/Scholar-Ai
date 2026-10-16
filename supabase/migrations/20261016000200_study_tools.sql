-- ScholarAI: study tools from future-enhancements/04 (exam countdown, Kannada answers,
-- mistake notebook, timed mock test). Only adds things; nothing existing is changed.
-- The unit completion rule (60% in any round) is NOT touched.

-- 1. Profile settings: exam date (countdown) and the AI answer language.
alter table public.profiles add column exam_date date;
alter table public.profiles
  add column language text not null default 'en' check (language in ('en', 'kn'));

-- Students may change these two as well (they still cannot touch streak or key hint).
grant update (exam_date, language) on public.profiles to authenticated;

-- 2. Mistake notebook: the list itself comes from wrong answers already saved in quiz_attempts.
--    This table only remembers revision progress: right twice in a row = cleared.
create table public.mistake_reviews (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  question text not null,
  right_streak smallint not null default 0 check (right_streak >= 0),
  cleared boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id, question)
);

-- 3. Timed mock tests with the exam's real marking scheme (incl. negative marks).
create table public.mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  score numeric(7, 2) not null,
  max_score numeric(7, 2) not null check (max_score > 0),
  correct smallint not null check (correct >= 0),
  wrong smallint not null check (wrong >= 0),
  skipped smallint not null check (skipped >= 0),
  seconds int not null check (seconds >= 0),
  created_at timestamptz not null default now()
);

create index mock_attempts_user_idx on public.mock_attempts (user_id, created_at desc);

-- Same rules as the other student tables: each student sees and writes only their own rows.
alter table public.mistake_reviews enable row level security;
alter table public.mock_attempts enable row level security;

create policy "read own reviews" on public.mistake_reviews
  for select to authenticated using (user_id = auth.uid());
create policy "add own reviews" on public.mistake_reviews
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own reviews" on public.mistake_reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read own mocks" on public.mock_attempts
  for select to authenticated using (user_id = auth.uid());
create policy "add own mocks" on public.mock_attempts
  for insert to authenticated with check (user_id = auth.uid());

grant select, insert, update on public.mistake_reviews to authenticated;
grant select, insert on public.mock_attempts to authenticated;
