-- ScholarAI: subtopics for every unit, and which seeded question belongs to which subtopic.
-- Drafted by AI. Review the names against the official syllabus before the college review.
--
-- How this file works:
--   pg_temp.sub('EXAM', 'Subject', 'Unit', 'Subtopic', round1, round2)
--     creates the subtopic and tags questions by their position in each round
--     (0 = first question of that round, as listed in 20261009000100_seed_content.sql).
-- At the end a check stops the whole migration if any question was left without a subtopic.

create function pg_temp.sub(p_exam text, p_subject text, p_unit text, p_name text, p_r1 int[], p_r2 int[])
returns void
language plpgsql
as $$
declare
  v_unit uuid;
  v_sub uuid;
begin
  select u.id into v_unit
  from public.units u
  join public.subjects s on s.id = u.subject_id
  join public.exams e on e.id = s.exam_id
  where e.code = p_exam and s.name = p_subject and u.name = p_unit;
  if v_unit is null then
    raise exception 'Unit not found: % / % / %', p_exam, p_subject, p_unit;
  end if;

  insert into public.subtopics (unit_id, name, sort_order)
  values (v_unit, p_name, (select count(*) from public.subtopics where unit_id = v_unit))
  on conflict (unit_id, name) do update set name = excluded.name
  returning id into v_sub;

  update public.questions
  set subtopic_id = v_sub
  where unit_id = v_unit
    and ((round = 1 and sort_order = any (p_r1)) or (round = 2 and sort_order = any (p_r2)));
end;
$$;

-- ============================================================
-- NIMCET
-- ============================================================
select pg_temp.sub('NIMCET', 'Mathematics', 'Algebra', 'Sets & Logarithms', '{0,3,4}', '{}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Algebra', 'Quadratics & Complex Numbers', '{1}', '{0,3}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Algebra', 'Sequences, Series & Combinations', '{2}', '{1,2,4}');

select pg_temp.sub('NIMCET', 'Mathematics', 'Calculus', 'Limits', '{3}', '{}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Calculus', 'Differentiation', '{0,1,4}', '{2,3}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Calculus', 'Applications of Derivatives', '{}', '{0,4}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Calculus', 'Integration', '{2}', '{1}');

select pg_temp.sub('NIMCET', 'Mathematics', 'Coordinate Geometry', 'Points & Distance', '{0,2}', '{3}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Coordinate Geometry', 'Straight Lines', '{1,4}', '{1,2}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Coordinate Geometry', 'Circles & Conics', '{3}', '{0,4}');

select pg_temp.sub('NIMCET', 'Mathematics', 'Probability & Statistics', 'Basic Probability', '{0,1}', '{1,2}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Probability & Statistics', 'Combined Events', '{}', '{0,3}');
select pg_temp.sub('NIMCET', 'Mathematics', 'Probability & Statistics', 'Averages & Spread', '{2,3,4}', '{4}');

select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Series & Patterns', 'Number Series', '{0,1,4}', '{0,1,3}');
select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Series & Patterns', 'Squares & Cubes', '{2}', '{4}');
select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Series & Patterns', 'Letter Series', '{3}', '{2}');

select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Coding-Decoding', 'Letter Shifting', '{0,3,4}', '{1}');
select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Coding-Decoding', 'Number Codes', '{1}', '{0,3,4}');
select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Coding-Decoding', 'Word & Reverse Codes', '{2}', '{2}');

select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Blood Relations & Directions', 'Blood Relations', '{0,2,4}', '{1,3}');
select pg_temp.sub('NIMCET', 'Analytical Ability & Logical Reasoning', 'Blood Relations & Directions', 'Directions & Distance', '{1,3}', '{0,2,4}');

select pg_temp.sub('NIMCET', 'Computer Awareness', 'Computer Organisation', 'CPU & Instructions', '{0,2}', '{1,4}');
select pg_temp.sub('NIMCET', 'Computer Awareness', 'Computer Organisation', 'Memory', '{1}', '{0,2}');
select pg_temp.sub('NIMCET', 'Computer Awareness', 'Computer Organisation', 'Data Units & Devices', '{3,4}', '{3}');

select pg_temp.sub('NIMCET', 'Computer Awareness', 'Number Systems', 'Binary', '{0,1}', '{1}');
select pg_temp.sub('NIMCET', 'Computer Awareness', 'Number Systems', 'Octal & Hexadecimal', '{2,3,4}', '{0,2}');
select pg_temp.sub('NIMCET', 'Computer Awareness', 'Number Systems', 'Binary Arithmetic & Complements', '{}', '{3,4}');

select pg_temp.sub('NIMCET', 'Computer Awareness', 'Boolean Algebra & Logic Gates', 'Logic Gates', '{0,1,4}', '{0,3}');
select pg_temp.sub('NIMCET', 'Computer Awareness', 'Boolean Algebra & Logic Gates', 'Boolean Laws', '{2,3}', '{1,2,4}');

select pg_temp.sub('NIMCET', 'General English', 'Grammar', 'Tenses & Verb Forms', '{1,4}', '{0,4}');
select pg_temp.sub('NIMCET', 'General English', 'Grammar', 'Subject-Verb Agreement', '{0,3}', '{1}');
select pg_temp.sub('NIMCET', 'General English', 'Grammar', 'Articles, Prepositions & Nouns', '{2}', '{2,3}');

select pg_temp.sub('NIMCET', 'General English', 'Vocabulary', 'Synonyms & Meanings', '{0,2,4}', '{0,3}');
select pg_temp.sub('NIMCET', 'General English', 'Vocabulary', 'Antonyms', '{1,3}', '{1}');
select pg_temp.sub('NIMCET', 'General English', 'Vocabulary', 'One-Word Substitution', '{}', '{2,4}');

select pg_temp.sub('NIMCET', 'General English', 'Sentence Improvement', 'Tense & Verb Errors', '{0,1}', '{4}');
select pg_temp.sub('NIMCET', 'General English', 'Sentence Improvement', 'Agreement Errors', '{3}', '{0,2}');
select pg_temp.sub('NIMCET', 'General English', 'Sentence Improvement', 'Redundancy & Comparison', '{2,4}', '{1,3}');

-- ============================================================
-- PGCET-MCA
-- ============================================================
select pg_temp.sub('PGCET-MCA', 'English Language', 'Grammar Usage', 'Verbs & Tenses', '{0,1}', '{2}');
select pg_temp.sub('PGCET-MCA', 'English Language', 'Grammar Usage', 'Subject-Verb Agreement', '{}', '{0,4}');
select pg_temp.sub('PGCET-MCA', 'English Language', 'Grammar Usage', 'Articles, Prepositions & Modifiers', '{2,3,4}', '{1,3}');

select pg_temp.sub('PGCET-MCA', 'English Language', 'Synonyms & Antonyms', 'Synonyms', '{0,2,4}', '{0,2,4}');
select pg_temp.sub('PGCET-MCA', 'English Language', 'Synonyms & Antonyms', 'Antonyms', '{1,3}', '{1,3}');

select pg_temp.sub('PGCET-MCA', 'English Language', 'Sentence Completion', 'Verb Forms', '{0,1,2}', '{}');
select pg_temp.sub('PGCET-MCA', 'English Language', 'Sentence Completion', 'Connectors & Prepositions', '{3,4}', '{2,3}');
select pg_temp.sub('PGCET-MCA', 'English Language', 'Sentence Completion', 'Word Choice in Context', '{}', '{0,1,4}');

select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Percentages & Profit', 'Percentages', '{0,2,3}', '{0,1,3}');
select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Percentages & Profit', 'Profit, Loss & Discount', '{1,4}', '{2,4}');

select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Ratio, Time & Work', 'Ratio & Proportion', '{0,1,4}', '{0,4}');
select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Ratio, Time & Work', 'Time & Work', '{2,3}', '{1,2}');
select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Ratio, Time & Work', 'Pipes & Cisterns', '{}', '{3}');

select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Algebra & Number Series', 'Linear Equations', '{0,2}', '{0}');
select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Algebra & Number Series', 'Identities & Powers', '{4}', '{2,4}');
select pg_temp.sub('PGCET-MCA', 'Quantitative Analysis', 'Algebra & Number Series', 'Number Series', '{1,3}', '{1,3}');

select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Syllogisms', '"All" Statements', '{0,1}', '{2,4}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Syllogisms', '"Some" Statements', '{3,4}', '{0,3}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Syllogisms', '"No" Statements', '{2}', '{1}');

select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Seating Arrangement', 'Linear Rows', '{0,1}', '{1,3}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Seating Arrangement', 'Circular & Square Tables', '{3}', '{0,4}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Seating Arrangement', 'Ranking & Position', '{2,4}', '{2}');

select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Analogies & Odd One Out', 'Word Analogies', '{0,2,4}', '{2}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Analogies & Odd One Out', 'Number & Letter Analogies', '{}', '{0,4}');
select pg_temp.sub('PGCET-MCA', 'Analytical & Logical Reasoning', 'Analogies & Odd One Out', 'Odd One Out', '{1,3}', '{1,3}');

select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Computer Fundamentals', 'History & Hardware', '{0,1,2,3}', '{}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Computer Fundamentals', 'Software & Languages', '{4}', '{0,2,3}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Computer Fundamentals', 'Data Units', '{}', '{1,4}');

select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Operating Systems & Software', 'OS Basics', '{0,1}', '{3}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Operating Systems & Software', 'Processes, Scheduling & Memory', '{}', '{0,1,2,4}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Operating Systems & Software', 'Files & Everyday Software', '{2,3,4}', '{}');

select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Networking & Internet', 'Internet & Web', '{0,2}', '{4}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Networking & Internet', 'Network Types & Devices', '{1,3}', '{3}');
select pg_temp.sub('PGCET-MCA', 'Computer Awareness', 'Networking & Internet', 'Protocols & Addressing', '{4}', '{0,1,2}');

-- ============================================================
-- MBA
-- ============================================================
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Percentages & Profit-Loss', 'Percentages', '{0,2,3}', '{2,3}');
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Percentages & Profit-Loss', 'Profit & Loss', '{1,4}', '{4}');
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Percentages & Profit-Loss', 'Discounts & Mark-up', '{}', '{0,1}');

select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Time, Speed & Distance', 'Speed, Time & Distance Basics', '{0,1,2,4}', '{4}');
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Time, Speed & Distance', 'Trains & Relative Speed', '{3}', '{1,2}');
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Time, Speed & Distance', 'Average Speed & Boats', '{}', '{0,3}');

select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Simple & Compound Interest', 'Simple Interest', '{0,1,3,4}', '{2,3}');
select pg_temp.sub('MBA', 'Quantitative Aptitude', 'Simple & Compound Interest', 'Compound Interest', '{2}', '{0,1,4}');

select pg_temp.sub('MBA', 'Verbal Ability', 'Vocabulary', 'Synonyms', '{0,2,4}', '{0,2,4}');
select pg_temp.sub('MBA', 'Verbal Ability', 'Vocabulary', 'Antonyms', '{1,3}', '{1,3}');

select pg_temp.sub('MBA', 'Verbal Ability', 'Idioms & Phrases', 'Talking & Secrets', '{0}', '{0,3}');
select pg_temp.sub('MBA', 'Verbal Ability', 'Idioms & Phrases', 'Work & Effort', '{2,4}', '{2}');
select pg_temp.sub('MBA', 'Verbal Ability', 'Idioms & Phrases', 'Feelings & Situations', '{1,3}', '{1,4}');

select pg_temp.sub('MBA', 'Verbal Ability', 'Error Spotting', 'Subject-Verb Agreement', '{0,2}', '{0,2}');
select pg_temp.sub('MBA', 'Verbal Ability', 'Error Spotting', 'Nouns, Pronouns & Comparatives', '{1}', '{1,3}');
select pg_temp.sub('MBA', 'Verbal Ability', 'Error Spotting', 'Tenses & Correct Sentences', '{3,4}', '{4}');

select pg_temp.sub('MBA', 'Logical Reasoning', 'Number & Letter Series', 'Number Series', '{0,2}', '{0,1,3}');
select pg_temp.sub('MBA', 'Logical Reasoning', 'Number & Letter Series', 'Square-Based Series', '{3}', '{4}');
select pg_temp.sub('MBA', 'Logical Reasoning', 'Number & Letter Series', 'Letter Series', '{1,4}', '{2}');

select pg_temp.sub('MBA', 'Logical Reasoning', 'Direction Sense', 'Directions & Turns', '{0,1,3,4}', '{1}');
select pg_temp.sub('MBA', 'Logical Reasoning', 'Direction Sense', 'Distance from Start', '{2}', '{0,3}');
select pg_temp.sub('MBA', 'Logical Reasoning', 'Direction Sense', 'Shadows & Clocks', '{}', '{2,4}');

select pg_temp.sub('MBA', 'Logical Reasoning', 'Statement & Conclusion', 'Conclusions', '{0,1,2,3}', '{0,1,2,4}');
select pg_temp.sub('MBA', 'Logical Reasoning', 'Statement & Conclusion', 'Assumptions & Courses of Action', '{4}', '{3}');

select pg_temp.sub('MBA', 'General Knowledge', 'Indian Economy & Business', 'Banking & Markets', '{0,3,4}', '{3}');
select pg_temp.sub('MBA', 'General Knowledge', 'Indian Economy & Business', 'Economic Terms', '{1,2}', '{2}');
select pg_temp.sub('MBA', 'General Knowledge', 'Indian Economy & Business', 'Government & Policy', '{}', '{0,1,4}');

select pg_temp.sub('MBA', 'General Knowledge', 'Static GK (India)', 'Geography', '{2,4}', '{0,3}');
select pg_temp.sub('MBA', 'General Knowledge', 'Static GK (India)', 'States & Places', '{0}', '{1,2}');
select pg_temp.sub('MBA', 'General Knowledge', 'Static GK (India)', 'Culture & Symbols', '{1,3}', '{4}');

select pg_temp.sub('MBA', 'General Knowledge', 'Indian Polity', 'Constitution & Its Parts', '{0,1,4}', '{2,3}');
select pg_temp.sub('MBA', 'General Knowledge', 'Indian Polity', 'Parliament', '{2}', '{1}');
select pg_temp.sub('MBA', 'General Knowledge', 'Indian Polity', 'President & Judiciary', '{3}', '{0,4}');

-- Safety check: every seeded question must now have a subtopic, and every unit must have subtopics.
do $$
declare
  v_untagged int;
  v_bare int;
begin
  select count(*) into v_untagged from public.questions where subtopic_id is null;
  select count(*) into v_bare from public.units u
  where not exists (select 1 from public.subtopics s where s.unit_id = u.id);
  if v_untagged > 0 or v_bare > 0 then
    raise exception 'Subtopic seed incomplete: % questions untagged, % units without subtopics', v_untagged, v_bare;
  end if;
end;
$$;
