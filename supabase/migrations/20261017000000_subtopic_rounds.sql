-- ScholarAI: 10 quiz rounds for every subtopic, and the new completion rule (user approved).
--   subtopic complete = 60% or more in any one of its rounds
--   unit complete     = every subtopic of the unit is complete
--   subject complete  = every unit of the subject is complete (worked out in the app)
-- The 370 existing questions move into their own subtopic's rounds, 5 per round, keeping their
-- old order. New questions are added by the next migration (…_seed_subtopic_rounds.sql).
-- The live Gemini "round 3" quiz is retired; Gemini still explains mistakes and runs the tutor.

-- 1. Questions: rounds 1 to 10, always inside a subtopic.
alter table public.questions drop constraint if exists questions_round_check;
alter table public.questions add constraint questions_round_check check (round between 1 and 10);

with ordered as (
  select id,
         row_number() over (partition by subtopic_id order by round, sort_order, id) - 1 as pos
  from public.questions
)
update public.questions q
set round = ordered.pos / 5 + 1,
    sort_order = ordered.pos % 5
from ordered
where ordered.id = q.id;

create index questions_subtopic_round_idx on public.questions (subtopic_id, round, sort_order);

-- 2. Attempts remember their subtopic. Older unit-level attempts keep it empty and no longer
--    complete anything on their own (their scores still show in the history).
alter table public.quiz_attempts drop constraint if exists quiz_attempts_round_check;
alter table public.quiz_attempts add constraint quiz_attempts_round_check
  check (round between 1 and 10);
alter table public.quiz_attempts
  add column subtopic_id uuid references public.subtopics (id) on delete set null;

create index quiz_attempts_subtopic_idx on public.quiz_attempts (user_id, subtopic_id);

-- 3. Progress of each subtopic (complete at 60% in any round).
create view public.subtopic_progress
with (security_invoker = true) as
select
  user_id,
  subtopic_id,
  unit_id,
  bool_or(percent >= 60) as completed,
  max(percent) as best_percent,
  max(created_at) as last_attempt_at
from public.quiz_attempts
where subtopic_id is not null
group by user_id, subtopic_id, unit_id;

grant select on public.subtopic_progress to authenticated;

-- 4. Unit progress: same columns as before, but "completed" now means every subtopic is complete.
create or replace view public.unit_progress
with (security_invoker = true) as
select
  a.user_id,
  a.unit_id,
  coalesce(
    (select count(*) from public.subtopics s where s.unit_id = a.unit_id) > 0
    and (select count(*) from public.subtopics s where s.unit_id = a.unit_id) = (
      select count(*)
      from public.subtopic_progress p
      where p.user_id = a.user_id and p.unit_id = a.unit_id and p.completed
    ),
    false
  ) as completed,
  max(a.percent) as best_percent,
  (array_agg(a.score order by a.created_at desc))[1] as last_score,
  (array_agg(a.total order by a.created_at desc))[1] as last_total,
  (array_agg(a.percent order by a.created_at desc))[1] as last_percent,
  max(a.created_at) as last_attempt_at
from public.quiz_attempts a
group by a.user_id, a.unit_id;
