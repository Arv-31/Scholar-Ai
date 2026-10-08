-- ScholarAI: streak logic + the Comfort Zone task list

-- ============================================================
-- 1. Mark a Comfort Zone task as done, and update the streak.
-- A day counts towards the streak when BOTH of that day's tasks are done.
-- Runs as "security definer" because students cannot edit streak columns themselves.
-- ============================================================

create function public.record_challenge(p_challenge_id int, p_day date)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  done_count int;
  me public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  -- "day" comes from the student's device; allow one day either side for time zones.
  if p_day < current_date - 1 or p_day > current_date + 1 then
    raise exception 'Invalid day';
  end if;

  insert into public.challenge_completions (user_id, challenge_id, day)
  values (auth.uid(), p_challenge_id, p_day)
  on conflict do nothing;

  select count(*) into done_count
  from public.challenge_completions
  where user_id = auth.uid() and day = p_day;

  select * into me from public.profiles where id = auth.uid();

  if done_count >= 2 and me.last_streak_date is distinct from p_day then
    update public.profiles
    set
      current_streak = case
        when last_streak_date = p_day - 1 then current_streak + 1
        else 1
      end,
      best_streak = greatest(
        best_streak,
        case when last_streak_date = p_day - 1 then current_streak + 1 else 1 end
      ),
      last_streak_date = p_day
    where id = auth.uid()
    returning * into me;
  end if;

  return me;
end;
$$;

revoke all on function public.record_challenge(int, date) from public, anon;
grant execute on function public.record_challenge(int, date) to authenticated;

-- ============================================================
-- 2. The rotating Comfort Zone list (two are picked per day by the app)
-- Small, real student-life things. No hustle talk.
-- ============================================================

insert into public.challenges (text) values
  ('Ask one question in class or in a study group that you would normally keep to yourself.'),
  ('Study for 25 minutes with your phone in another room.'),
  ('Message a classmate you rarely talk to and ask how their prep is going.'),
  ('Explain one topic you learned this week out loud, as if teaching a friend.'),
  ('Eat lunch or have tea somewhere new on campus or near home.'),
  ('Attempt one question from a topic you have been avoiding.'),
  ('Go for a 15-minute walk without earphones.'),
  ('Write down three things you got done today, however small.'),
  ('Read 10 pages of a book that is not a textbook.'),
  ('Tidy your study table before you start today.'),
  ('Call a family member or an old friend just to talk.'),
  ('Sleep 30 minutes earlier than usual tonight.'),
  ('Solve a few practice questions with a timer on.'),
  ('Say no to one thing today that would eat up your study time.'),
  ('Try a new way of revising: draw a mind map or make flashcards.'),
  ('Drink a glass of water first thing in the morning and keep a bottle on your desk.');
