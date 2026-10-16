-- ScholarAI: subtopics (smaller parts of a unit). Each subtopic gets its own paper (mastery) in the app.
--
-- Nothing per-student is stored here: a subtopic's mastery is worked out in the app from data we
-- already save (quiz answers and video watch %), so nothing can go out of sync.
-- The unit completion rule (60% in any round, see the unit_progress view) is NOT changed.

create table public.subtopics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  unique (unit_id, name)
);

create index subtopics_unit_id_idx on public.subtopics (unit_id);

-- Which subtopic a question tests / a video covers. Optional: empty is allowed.
alter table public.questions
  add column subtopic_id uuid references public.subtopics (id) on delete set null;

alter table public.unit_videos
  add column subtopic_id uuid references public.subtopics (id) on delete set null;

-- Same rules as the other content tables: every logged-in student can read, nobody can write
-- from the browser (only migrations and Edge Functions).
alter table public.subtopics enable row level security;

create policy "read subtopics" on public.subtopics for select to authenticated using (true);

grant select on public.subtopics to authenticated;
