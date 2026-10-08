-- ScholarAI: starter content (exams, subjects, units, quiz rounds 1 and 2)
-- Drafted by AI. Review against the official syllabus before the college review.
--
-- How this file works:
--   pg_temp.unit('EXAM', 'Subject', 'Unit')  -> creates the subject/unit (if new) and makes it "current"
--   pg_temp.q(round, 'question', array[4 options], correct_index)  -> adds a question to the current unit
-- correct_index counts from 0 (0 = first option).

insert into public.exams (code, name, sort_order) values
  ('NIMCET', 'NIMCET (NIT MCA Common Entrance Test)', 1),
  ('PGCET-MCA', 'Karnataka PGCET (MCA)', 2),
  ('MBA', 'MBA Entrance (Quant, Verbal, Logical, GK)', 3);

create function pg_temp.unit(p_exam text, p_subject text, p_unit text)
returns void
language plpgsql
as $$
declare
  v_exam uuid;
  v_subject uuid;
  v_unit uuid;
begin
  select id into v_exam from public.exams where code = p_exam;

  select id into v_subject from public.subjects where exam_id = v_exam and name = p_subject;
  if v_subject is null then
    insert into public.subjects (exam_id, name, sort_order)
    values (v_exam, p_subject, (select count(*) from public.subjects where exam_id = v_exam))
    returning id into v_subject;
  end if;

  insert into public.units (subject_id, name, sort_order)
  values (v_subject, p_unit, (select count(*) from public.units where subject_id = v_subject))
  returning id into v_unit;

  perform set_config('seed.unit', v_unit::text, false);
end;
$$;

create function pg_temp.q(p_round int, p_question text, p_options text[], p_correct int)
returns void
language sql
as $$
  insert into public.questions (unit_id, round, question, options, correct_index, sort_order)
  select
    current_setting('seed.unit')::uuid, p_round, p_question, p_options, p_correct,
    (select count(*) from public.questions
     where unit_id = current_setting('seed.unit')::uuid and round = p_round);
$$;

-- ============================================================
-- NIMCET
-- ============================================================

select pg_temp.unit('NIMCET', 'Mathematics', 'Algebra');
select pg_temp.q(1, 'If A = {1, 2, 3} and B = {2, 3, 4}, then A ∩ B is:', array['{2, 3}', '{1, 4}', '{1, 2, 3, 4}', 'Empty set'], 0);
select pg_temp.q(1, 'The roots of x² − 5x + 6 = 0 are:', array['1 and 6', '2 and 3', '−2 and −3', '−1 and 6'], 1);
select pg_temp.q(1, 'The sum of the first 10 natural numbers is:', array['45', '50', '55', '60'], 2);
select pg_temp.q(1, 'If log₂ x = 5, then x is:', array['10', '25', '64', '32'], 3);
select pg_temp.q(1, 'How many subsets does a set with 4 elements have?', array['16', '8', '12', '4'], 0);
select pg_temp.q(2, 'The sum of the roots of 2x² − 8x + 3 = 0 is:', array['4', '−4', '3/2', '8'], 0);
select pg_temp.q(2, 'The 10th term of the AP 3, 7, 11, … is:', array['43', '39', '40', '37'], 1);
select pg_temp.q(2, 'The value of ⁵C₂ is:', array['20', '5', '10', '15'], 2);
select pg_temp.q(2, 'If z = 3 + 4i, then |z| is:', array['7', '5', '25', '1'], 1);
select pg_temp.q(2, 'The sum of the infinite GP 1 + 1/2 + 1/4 + … is:', array['1', '3/2', 'Infinite', '2'], 3);

select pg_temp.unit('NIMCET', 'Mathematics', 'Calculus');
select pg_temp.q(1, 'd/dx (x³) is:', array['x²', '3x²', '3x', 'x³/3'], 1);
select pg_temp.q(1, 'd/dx (sin x) is:', array['cos x', '−cos x', 'tan x', '−sin x'], 0);
select pg_temp.q(1, '∫ 2x dx is:', array['2x² + C', 'x + C', 'x² + C', '2 + C'], 2);
select pg_temp.q(1, 'The limit of (sin x)/x as x → 0 is:', array['0', 'Infinity', 'Undefined', '1'], 3);
select pg_temp.q(1, 'd/dx (eˣ) is:', array['eˣ', 'x·eˣ⁻¹', '1', '0'], 0);
select pg_temp.q(2, 'The minimum value of x² − 4x + 7 is:', array['7', '3', '4', '0'], 1);
select pg_temp.q(2, '∫ from 0 to 1 of x dx is:', array['1/2', '1', '2', '0'], 0);
select pg_temp.q(2, 'd/dx (ln x), for x > 0, is:', array['x', '(ln x)/x', '1/x', 'eˣ'], 2);
select pg_temp.q(2, 'If f(x) = x² + 3x, then f′(2) is:', array['10', '4', '13', '7'], 3);
select pg_temp.q(2, 'The slope of the tangent to y = x³ at x = 1 is:', array['1', '2', '3', '0'], 2);

select pg_temp.unit('NIMCET', 'Mathematics', 'Coordinate Geometry');
select pg_temp.q(1, 'The distance between (0, 0) and (3, 4) is:', array['7', '5', '25', '1'], 1);
select pg_temp.q(1, 'The slope of the line through (1, 2) and (3, 6) is:', array['2', '4', '1/2', '3'], 0);
select pg_temp.q(1, 'The midpoint of (2, 4) and (6, 8) is:', array['(8, 12)', '(3, 5)', '(4, 6)', '(2, 2)'], 2);
select pg_temp.q(1, 'The centre of the circle x² + y² − 4x + 6y − 3 = 0 is:', array['(−2, 3)', '(2, −3)', '(4, −6)', '(−4, 6)'], 1);
select pg_temp.q(1, 'The line y = 3x + 2 cuts the y-axis at:', array['(2, 0)', '(0, 3)', '(−2/3, 0)', '(0, 2)'], 3);
select pg_temp.q(2, 'The radius of the circle x² + y² = 49 is:', array['49', '7', '14', '24.5'], 1);
select pg_temp.q(2, 'The lines y = 2x + 1 and y = 2x − 5 are:', array['Parallel', 'Perpendicular', 'Coincident', 'Meeting at the origin'], 0);
select pg_temp.q(2, 'The slope of a line perpendicular to y = 4x + 1 is:', array['4', '−4', '1/4', '−1/4'], 3);
select pg_temp.q(2, 'The distance from (0, 0) to the line 3x + 4y − 10 = 0 is:', array['10', '5', '2', '1'], 2);
select pg_temp.q(2, 'The focus of the parabola y² = 8x is:', array['(2, 0)', '(8, 0)', '(0, 2)', '(4, 0)'], 0);

select pg_temp.unit('NIMCET', 'Mathematics', 'Probability & Statistics');
select pg_temp.q(1, 'The probability of getting a head when a fair coin is tossed is:', array['1/4', '1/2', '1', '0'], 1);
select pg_temp.q(1, 'A die is rolled. The probability of an even number is:', array['1/6', '1/3', '1/2', '2/3'], 2);
select pg_temp.q(1, 'The mean of 2, 4, 6, 8, 10 is:', array['5', '6', '7', '30'], 1);
select pg_temp.q(1, 'The median of 3, 1, 7, 5, 9 is:', array['5', '7', '3', '9'], 0);
select pg_temp.q(1, 'The mode of 2, 3, 3, 5, 3, 7 is:', array['2', '5', '7', '3'], 3);
select pg_temp.q(2, 'Two coins are tossed. The probability of at least one head is:', array['1/4', '1/2', '3/4', '1'], 2);
select pg_temp.q(2, 'A card is drawn from a 52-card deck. The probability it is a king is:', array['1/13', '1/52', '4/13', '1/4'], 0);
select pg_temp.q(2, 'If P(A) = 0.3, then P(not A) is:', array['0.3', '0.7', '1.3', '0'], 1);
select pg_temp.q(2, 'Two dice are rolled. The probability that the sum is 7 is:', array['1/12', '7/36', '1/6', '1/36'], 2);
select pg_temp.q(2, 'The variance of 2, 2, 2, 2 is:', array['2', '4', '1', '0'], 3);

select pg_temp.unit('NIMCET', 'Analytical Ability & Logical Reasoning', 'Series & Patterns');
select pg_temp.q(1, 'Find the next number: 2, 4, 8, 16, ?', array['24', '32', '30', '20'], 1);
select pg_temp.q(1, 'Find the next number: 3, 6, 9, 12, ?', array['15', '14', '18', '16'], 0);
select pg_temp.q(1, 'Find the next number: 1, 4, 9, 16, ?', array['20', '25', '24', '36'], 1);
select pg_temp.q(1, 'Find the next letter: A, C, E, G, ?', array['I', 'H', 'J', 'K'], 0);
select pg_temp.q(1, 'Find the next number: 5, 10, 20, 40, ?', array['60', '70', '80', '50'], 2);
select pg_temp.q(2, 'Find the next number: 2, 6, 12, 20, 30, ?', array['40', '42', '36', '44'], 1);
select pg_temp.q(2, 'Find the next number: 1, 1, 2, 3, 5, 8, ?', array['11', '12', '13', '15'], 2);
select pg_temp.q(2, 'Find the next letter: Z, X, V, T, ?', array['S', 'R', 'Q', 'P'], 1);
select pg_temp.q(2, 'Find the next number: 7, 14, 28, 56, ?', array['84', '98', '112', '70'], 2);
select pg_temp.q(2, 'Find the next number: 1, 8, 27, 64, ?', array['100', '81', '216', '125'], 3);

select pg_temp.unit('NIMCET', 'Analytical Ability & Logical Reasoning', 'Coding-Decoding');
select pg_temp.q(1, 'If CAT is coded as DBU, how is DOG coded?', array['EPH', 'CNF', 'DPH', 'EOG'], 0);
select pg_temp.q(1, 'If A = 1, B = 2, C = 3 and so on, how is BED written?', array['2-4-5', '2-5-4', '3-5-4', '2-6-4'], 1);
select pg_temp.q(1, 'If APPLE is written as ELPPA, how is MANGO written?', array['ONGAM', 'MAGNO', 'OGNAM', 'OGANM'], 2);
select pg_temp.q(1, 'If BOOK is written as CPPL, how is PEN written?', array['OEM', 'QEO', 'PFO', 'QFO'], 3);
select pg_temp.q(1, 'Each letter of a word is shifted forward by 1 to get IBU. What is the word?', array['JCV', 'HAT', 'HAS', 'GAT'], 1);
select pg_temp.q(2, 'If ROSE is coded as 6821 and CHAIR as 73456, how is SEARCH coded?', array['216473', '214763', '214673', '241673'], 2);
select pg_temp.q(2, 'If TRAIN is coded as UQBHO, how is PLANE coded?', array['QMBKF', 'QKBMF', 'OKBMF', 'QKCMF'], 1);
select pg_temp.q(2, 'In a code, "sky is blue" is "ta na ko" and "blue is ocean" is "ko pa ta". Which code means "sky"?', array['ta', 'ko', 'pa', 'na'], 3);
select pg_temp.q(2, 'If A = 1, B = 2, C = 3 and so on, the sum of the letters in ACE is:', array['8', '9', '10', '15'], 1);
select pg_temp.q(2, 'If GIVE is coded as 5137 and BAT as 924, how is GATE coded?', array['5427', '5724', '5247', '2547'], 2);

select pg_temp.unit('NIMCET', 'Analytical Ability & Logical Reasoning', 'Blood Relations & Directions');
select pg_temp.q(1, 'A is the father of B. B is the sister of C. How is A related to C?', array['Father', 'Uncle', 'Brother', 'Grandfather'], 0);
select pg_temp.q(1, 'Rahul walks 5 km north, then 5 km east. In which direction is he from the start?', array['North', 'East', 'North-East', 'South-East'], 2);
select pg_temp.q(1, 'Pointing to a boy, Priya says, "He is the son of my mother''s only son." The boy is Priya''s:', array['Brother', 'Nephew', 'Cousin', 'Son'], 1);
select pg_temp.q(1, 'You are facing north and turn right. Which direction are you facing now?', array['South', 'West', 'East', 'North'], 2);
select pg_temp.q(1, 'X is the brother of Y, and Y is the daughter of Z. How is X related to Z?', array['Son', 'Brother', 'Father', 'Nephew'], 0);
select pg_temp.q(2, 'Ravi walks 10 m south, turns left and walks 10 m, then turns left and walks 10 m. Where is he from the start?', array['North', 'East', 'West', 'South'], 1);
select pg_temp.q(2, 'B is a woman. A''s mother is B''s sister. B is A''s:', array['Mother', 'Aunt', 'Sister', 'Grandmother'], 1);
select pg_temp.q(2, 'You face east and turn 90° clockwise twice. Which direction are you facing now?', array['North', 'South', 'West', 'East'], 2);
select pg_temp.q(2, 'P is the son of Q. Q is the daughter of R. How is R related to P?', array['Uncle', 'Grandparent', 'Father', 'Brother'], 1);
select pg_temp.q(2, 'A man walks 3 km east and then 4 km north. How far is he from the start?', array['7 km', '1 km', '5 km', '12 km'], 2);

select pg_temp.unit('NIMCET', 'Computer Awareness', 'Computer Organisation');
select pg_temp.q(1, 'CPU stands for:', array['Central Processing Unit', 'Central Program Unit', 'Computer Processing Unit', 'Control Processing Unit'], 0);
select pg_temp.q(1, 'Which memory is volatile?', array['ROM', 'RAM', 'Hard disk', 'DVD'], 1);
select pg_temp.q(1, 'Which part of the CPU performs arithmetic and logic operations?', array['Control Unit', 'Register', 'ALU', 'Cache'], 2);
select pg_temp.q(1, '1 byte is equal to:', array['4 bits', '16 bits', '2 bits', '8 bits'], 3);
select pg_temp.q(1, 'Which of these is an input device?', array['Keyboard', 'Monitor', 'Printer', 'Speaker'], 0);
select pg_temp.q(2, 'Which of these memories is the fastest?', array['Hard disk', 'RAM', 'Cache', 'Pen drive'], 2);
select pg_temp.q(2, 'The program counter holds:', array['The current result', 'The address of the next instruction', 'The number of programs', 'The stack size'], 1);
select pg_temp.q(2, 'Which non-volatile memory stores the firmware that starts the computer?', array['RAM', 'Cache', 'Registers', 'ROM'], 3);
select pg_temp.q(2, '1 KB (binary) is equal to:', array['1000 bytes', '1024 bytes', '1024 bits', '512 bytes'], 1);
select pg_temp.q(2, 'Which bus carries memory addresses from the CPU?', array['Data bus', 'Control bus', 'Address bus', 'USB'], 2);

select pg_temp.unit('NIMCET', 'Computer Awareness', 'Number Systems');
select pg_temp.q(1, 'The binary form of decimal 5 is:', array['101', '110', '111', '100'], 0);
select pg_temp.q(1, 'The decimal value of binary 1010 is:', array['8', '10', '12', '5'], 1);
select pg_temp.q(1, 'The base of the hexadecimal system is:', array['2', '8', '10', '16'], 3);
select pg_temp.q(1, 'The hexadecimal digit for decimal 15 is:', array['F', 'E', 'D', '15'], 0);
select pg_temp.q(1, 'The octal number system uses the digits:', array['0 to 8', '1 to 8', '0 to 7', '0 to 9'], 2);
select pg_temp.q(2, 'Hexadecimal 1F in decimal is:', array['25', '31', '15', '32'], 1);
select pg_temp.q(2, 'Binary 1111 in decimal is:', array['16', '14', '15', '17'], 2);
select pg_temp.q(2, 'Decimal 64 in octal is:', array['80', '64', '77', '100'], 3);
select pg_temp.q(2, 'The 1''s complement of 1010 is:', array['0101', '1011', '0110', '1010'], 0);
select pg_temp.q(2, 'Binary 1011 + 0110 is:', array['1101', '10011', '10001', '11001'], 2);

select pg_temp.unit('NIMCET', 'Computer Awareness', 'Boolean Algebra & Logic Gates');
select pg_temp.q(1, 'The output of an AND gate is 1 when:', array['Any input is 1', 'All inputs are 1', 'All inputs are 0', 'The inputs differ'], 1);
select pg_temp.q(1, 'Which gate is called a universal gate?', array['AND', 'OR', 'NAND', 'XOR'], 2);
select pg_temp.q(1, 'A + 0 is equal to:', array['0', '1', 'A', 'A′'], 2);
select pg_temp.q(1, 'A · A′ is equal to:', array['A', '1', 'A′', '0'], 3);
select pg_temp.q(1, 'How many inputs does a NOT gate have?', array['1', '2', '3', 'Any number'], 0);
select pg_temp.q(2, 'The output of an XOR gate is 1 when:', array['Both inputs are 1', 'The inputs are different', 'Both inputs are 0', 'Always'], 1);
select pg_temp.q(2, 'A + A·B simplifies to:', array['A', 'B', 'A·B', 'A + B'], 0);
select pg_temp.q(2, 'By De Morgan''s law, (A + B)′ is equal to:', array['A′ + B′', 'A′ · B′', 'A · B', '(A · B)′'], 1);
select pg_temp.q(2, 'The output of a NOR gate when both inputs are 0 is:', array['0', 'Undefined', '1', 'Same as the input'], 2);
select pg_temp.q(2, 'A + 1 is equal to:', array['A', '0', 'A′', '1'], 3);

select pg_temp.unit('NIMCET', 'General English', 'Grammar');
select pg_temp.q(1, 'Choose the correct word: "She ___ to college every day."', array['go', 'goes', 'going', 'gone'], 1);
select pg_temp.q(1, 'Choose the correct word: "He has been working here ___ 2020."', array['since', 'for', 'from', 'by'], 0);
select pg_temp.q(1, 'The plural of "child" is:', array['childs', 'childes', 'children', 'childrens'], 2);
select pg_temp.q(1, 'Choose the correct word: "Neither of the boys ___ present."', array['were', 'are', 'was', 'have been'], 2);
select pg_temp.q(1, 'The past tense of "write" is:', array['writed', 'wrote', 'written', 'writing'], 1);
select pg_temp.q(2, 'Choose the correct word: "If I ___ you, I would apologise."', array['was', 'am', 'were', 'be'], 2);
select pg_temp.q(2, 'Choose the correct word: "The news ___ good."', array['are', 'were', 'is', 'have'], 2);
select pg_temp.q(2, 'Choose the correct article: "___ honest man"', array['A', 'An', 'The', 'No article'], 1);
select pg_temp.q(2, 'Choose the correct word: "He is good ___ mathematics."', array['in', 'at', 'on', 'with'], 1);
select pg_temp.q(2, 'The passive form of "She writes a letter" is:', array['A letter was written by her', 'A letter has been written by her', 'A letter is being written by her', 'A letter is written by her'], 3);

select pg_temp.unit('NIMCET', 'General English', 'Vocabulary');
select pg_temp.q(1, 'Synonym of "Abundant":', array['Scarce', 'Plentiful', 'Rare', 'Empty'], 1);
select pg_temp.q(1, 'Antonym of "Ancient":', array['Modern', 'Old', 'Historic', 'Aged'], 0);
select pg_temp.q(1, 'Synonym of "Brief":', array['Long', 'Wide', 'Short', 'Deep'], 2);
select pg_temp.q(1, 'Antonym of "Generous":', array['Kind', 'Selfish', 'Giving', 'Liberal'], 1);
select pg_temp.q(1, 'Meaning of "Candid":', array['Shy', 'Rude', 'Clever', 'Frank'], 3);
select pg_temp.q(2, 'Synonym of "Diligent":', array['Lazy', 'Hardworking', 'Careless', 'Slow'], 1);
select pg_temp.q(2, 'Antonym of "Transparent":', array['Clear', 'Opaque', 'Visible', 'Bright'], 1);
select pg_temp.q(2, 'One word for "a person who cannot read or write":', array['Illiterate', 'Ignorant', 'Innocent', 'Immature'], 0);
select pg_temp.q(2, 'Synonym of "Obsolete":', array['Modern', 'Popular', 'Outdated', 'Useful'], 2);
select pg_temp.q(2, 'One word for "a place where birds are kept":', array['Apiary', 'Zoo', 'Aquarium', 'Aviary'], 3);

select pg_temp.unit('NIMCET', 'General English', 'Sentence Improvement');
select pg_temp.q(1, 'Improve: "He did not knew the answer."', array['did not know', 'does not knew', 'did not known', 'No improvement'], 0);
select pg_temp.q(1, 'Improve: "I am living here since 2015."', array['was living', 'have been living', 'am lived', 'No improvement'], 1);
select pg_temp.q(1, 'Improve: "She is more smarter than her brother."', array['most smarter', 'more smart', 'smarter', 'No improvement'], 2);
select pg_temp.q(1, 'Improve: "Each of the students have a book."', array['has a book', 'having a book', 'had have a book', 'No improvement'], 0);
select pg_temp.q(1, 'Improve: "We discussed about the plan."', array['discussed on the plan', 'discussed the plan', 'discussing about the plan', 'No improvement'], 1);
select pg_temp.q(2, 'Improve: "One of my friend is a doctor."', array['One of my friends is', 'One of my friends are', 'One my friend is', 'No improvement'], 0);
select pg_temp.q(2, 'Improve: "He returned back home late."', array['returned back to home', 'returned home', 'return back home', 'No improvement'], 1);
select pg_temp.q(2, 'Improve: "The furniture are new."', array['furnitures are', 'furniture is', 'furnitures is', 'No improvement'], 1);
select pg_temp.q(2, 'Improve: "Unless you do not work hard, you will fail."', array['If you do not hard work', 'Unless you will work hard', 'Unless you work hard', 'No improvement'], 2);
select pg_temp.q(2, 'Improve: "She has gone to the market yesterday."', array['had gone', 'went', 'has went', 'No improvement'], 1);

-- ============================================================
-- PGCET-MCA
-- ============================================================

select pg_temp.unit('PGCET-MCA', 'English Language', 'Grammar Usage');
select pg_temp.q(1, 'Choose the correct word: "The sun ___ in the east."', array['rise', 'rises', 'rising', 'rose'], 1);
select pg_temp.q(1, 'Choose the correct word: "They ___ playing cricket now."', array['is', 'am', 'are', 'be'], 2);
select pg_temp.q(1, 'Choose the correct article: "I have ___ umbrella."', array['a', 'an', 'the', 'no article'], 1);
select pg_temp.q(1, 'Choose the correct word: "She sings ___."', array['beautiful', 'beautifully', 'beauty', 'beautify'], 1);
select pg_temp.q(1, 'Choose the correct word: "He is senior ___ me."', array['than', 'to', 'from', 'over'], 1);
select pg_temp.q(2, 'Choose the correct word: "Mathematics ___ my favourite subject."', array['are', 'were', 'is', 'have'], 2);
select pg_temp.q(2, 'Choose the correct word: "He insisted ___ paying the bill."', array['for', 'to', 'on', 'at'], 2);
select pg_temp.q(2, 'Choose the correct form: "By next year, she ___ her degree."', array['completes', 'will have completed', 'completed', 'has completing'], 1);
select pg_temp.q(2, 'Choose the correct word: "Hardly had I reached the station ___ the train left."', array['than', 'then', 'when', 'while'], 2);
select pg_temp.q(2, 'Choose the correct word: "Either Ram or his friends ___ coming."', array['is', 'are', 'was', 'has'], 1);

select pg_temp.unit('PGCET-MCA', 'English Language', 'Synonyms & Antonyms');
select pg_temp.q(1, 'Synonym of "Happy":', array['Sad', 'Joyful', 'Angry', 'Tired'], 1);
select pg_temp.q(1, 'Antonym of "Expand":', array['Grow', 'Contract', 'Spread', 'Extend'], 1);
select pg_temp.q(1, 'Synonym of "Rapid":', array['Quick', 'Slow', 'Late', 'Weak'], 0);
select pg_temp.q(1, 'Antonym of "Victory":', array['Win', 'Success', 'Defeat', 'Triumph'], 2);
select pg_temp.q(1, 'Synonym of "Begin":', array['End', 'Stop', 'Finish', 'Start'], 3);
select pg_temp.q(2, 'Synonym of "Meticulous":', array['Careless', 'Careful and precise', 'Quick', 'Lazy'], 1);
select pg_temp.q(2, 'Antonym of "Humble":', array['Modest', 'Proud', 'Simple', 'Polite'], 1);
select pg_temp.q(2, 'Synonym of "Vivid":', array['Dull', 'Faint', 'Bright and clear', 'Vague'], 2);
select pg_temp.q(2, 'Antonym of "Scarce":', array['Rare', 'Few', 'Abundant', 'Limited'], 2);
select pg_temp.q(2, 'Synonym of "Feeble":', array['Weak', 'Strong', 'Bold', 'Firm'], 0);

select pg_temp.unit('PGCET-MCA', 'English Language', 'Sentence Completion');
select pg_temp.q(1, '"She was so tired that she ___ asleep at once."', array['fell', 'fall', 'falls', 'felt'], 0);
select pg_temp.q(1, '"The teacher asked us to ___ our homework on time."', array['submission', 'submit', 'submitted', 'submits'], 1);
select pg_temp.q(1, '"Despite the rain, the match ___."', array['continuing', 'continue', 'continued', 'continues to be'], 2);
select pg_temp.q(1, '"He works hard ___ he wants to pass."', array['but', 'because', 'although', 'unless'], 1);
select pg_temp.q(1, '"The book is ___ the table."', array['in', 'on', 'at', 'into'], 1);
select pg_temp.q(2, '"His explanation was so ___ that everyone understood it."', array['vague', 'lucid', 'confusing', 'complex'], 1);
select pg_temp.q(2, '"She was ___ about the result, so she checked it again."', array['doubtful', 'certain', 'careless', 'happy'], 0);
select pg_temp.q(2, '"The project failed ___ poor planning."', array['despite', 'because of', 'although', 'instead of'], 1);
select pg_temp.q(2, '"He spoke so softly that we could ___ hear him."', array['hard', 'never', 'hardly', 'always'], 2);
select pg_temp.q(2, '"To save money, she decided to ___ her expenses."', array['increase', 'ignore', 'double', 'curtail'], 3);

select pg_temp.unit('PGCET-MCA', 'Quantitative Analysis', 'Percentages & Profit');
select pg_temp.q(1, '20% of 150 is:', array['20', '25', '30', '35'], 2);
select pg_temp.q(1, 'A shirt bought for ₹400 is sold for ₹500. The profit percent is:', array['20%', '25%', '10%', '100%'], 1);
select pg_temp.q(1, '50% of 50% of 200 is:', array['25', '50', '100', '75'], 1);
select pg_temp.q(1, '80 increased by 25% is:', array['100', '105', '95', '120'], 0);
select pg_temp.q(1, 'An item costing ₹200 is sold at a 10% loss. The selling price is:', array['₹190', '₹180', '₹210', '₹220'], 1);
select pg_temp.q(2, 'A price rises from ₹50 to ₹60. The percentage increase is:', array['10%', '20%', '16.67%', '25%'], 1);
select pg_temp.q(2, 'A number is increased by 10% and then decreased by 10%. The net change is:', array['No change', '1% increase', '1% decrease', '2% decrease'], 2);
select pg_temp.q(2, 'An item is sold for ₹600 at a 20% profit. The cost price is:', array['₹480', '₹500', '₹520', '₹720'], 1);
select pg_temp.q(2, '15% of a number is 45. The number is:', array['300', '250', '350', '400'], 0);
select pg_temp.q(2, 'The marked price is ₹1000 and the discount is 15%. The selling price is:', array['₹900', '₹800', '₹150', '₹850'], 3);

select pg_temp.unit('PGCET-MCA', 'Quantitative Analysis', 'Ratio, Time & Work');
select pg_temp.q(1, '12 : 18 in its simplest form is:', array['2 : 3', '3 : 2', '4 : 6', '6 : 9'], 0);
select pg_temp.q(1, '₹600 is divided in the ratio 1 : 2. The larger share is:', array['₹200', '₹300', '₹400', '₹450'], 2);
select pg_temp.q(1, 'A can finish a job in 10 days. How much of the job does A do in 1 day?', array['1/5', '1/10', '10', '1/20'], 1);
select pg_temp.q(1, 'A can finish a job in 6 days and B in 12 days. Working together, they take:', array['3 days', '4 days', '6 days', '9 days'], 1);
select pg_temp.q(1, 'If 5 pens cost ₹50, then 8 pens cost:', array['₹80', '₹70', '₹90', '₹100'], 0);
select pg_temp.q(2, 'If a : b = 2 : 3 and b : c = 3 : 4, then a : c is:', array['3 : 4', '1 : 2', '2 : 3', '4 : 3'], 1);
select pg_temp.q(2, '6 workers finish a job in 10 days. How many days will 12 workers take?', array['20', '8', '5', '15'], 2);
select pg_temp.q(2, 'A and B together finish a job in 8 days. A alone takes 12 days. B alone takes:', array['20 days', '16 days', '24 days', '30 days'], 2);
select pg_temp.q(2, 'One pipe fills a tank in 4 hours; another empties it in 6 hours. With both open, the tank fills in:', array['10 hours', '12 hours', '8 hours', '24 hours'], 1);
select pg_temp.q(2, 'The ages of two people are in the ratio 3 : 5 and add up to 40. The younger is:', array['25', '12', '20', '15'], 3);

select pg_temp.unit('PGCET-MCA', 'Quantitative Analysis', 'Algebra & Number Series');
select pg_temp.q(1, 'If 2x + 3 = 11, then x is:', array['3', '4', '5', '7'], 1);
select pg_temp.q(1, 'Find the next number: 5, 11, 17, 23, ?', array['27', '28', '29', '30'], 2);
select pg_temp.q(1, 'If x/4 = 6, then x is:', array['10', '24', '2', '1.5'], 1);
select pg_temp.q(1, 'Find the next number: 2, 3, 5, 7, 11, ?', array['13', '12', '14', '15'], 0);
select pg_temp.q(1, '(a + b)² is equal to:', array['a² + b²', 'a² + 2ab + b²', 'a² − 2ab + b²', '2a + 2b'], 1);
select pg_temp.q(2, 'If x + y = 10 and x − y = 4, then x is:', array['6', '7', '3', '5'], 1);
select pg_temp.q(2, 'Find the next number: 3, 9, 27, 81, ?', array['162', '324', '243', '108'], 2);
select pg_temp.q(2, 'If x² = 49 and x < 0, then x is:', array['7', '−7', '49', '−49'], 1);
select pg_temp.q(2, 'Find the missing number: 4, 9, 16, ?, 36', array['20', '24', '25', '30'], 2);
select pg_temp.q(2, 'The value of 3² + 4² is:', array['49', '7', '12', '25'], 3);

select pg_temp.unit('PGCET-MCA', 'Analytical & Logical Reasoning', 'Syllogisms');
select pg_temp.q(1, 'All cats are animals. All animals are living beings. Which conclusion follows?', array['All cats are living beings', 'All living beings are cats', 'No cat is a living being', 'Some animals are not cats'], 0);
select pg_temp.q(1, 'All pens on this desk are blue. This is a pen from the desk. So:', array['It is not blue', 'It is blue', 'It may be red', 'Cannot say'], 1);
select pg_temp.q(1, 'No fish is a bird. All sparrows are birds. Which conclusion follows?', array['Some sparrows are fish', 'No sparrow is a fish', 'All fish are sparrows', 'Some birds are fish'], 1);
select pg_temp.q(1, 'Some books are pens. All pens are bags. Which conclusion follows?', array['All books are bags', 'No book is a bag', 'Some books are bags', 'All bags are books'], 2);
select pg_temp.q(1, 'All roses are flowers. Some flowers fade quickly. Which conclusion follows?', array['All roses fade quickly', 'Some roses fade quickly', 'No rose fades quickly', 'None of these follows for sure'], 3);
select pg_temp.q(2, 'All students are learners. Some learners are teachers. Which conclusion follows?', array['All students are teachers', 'Some students are teachers', 'Some learners are students', 'No student is a teacher'], 2);
select pg_temp.q(2, 'No apple is a mango. Some mangoes are sweet. Which conclusion follows?', array['Some sweet things are not apples', 'All sweet things are apples', 'Some apples are sweet', 'No apple is sweet'], 0);
select pg_temp.q(2, 'All A are B. All B are C. Which is true?', array['All C are A', 'All A are C', 'No A is C', 'Some C are not B'], 1);
select pg_temp.q(2, 'Some dogs are cats. Some cats are rats. Which conclusion definitely follows?', array['Some dogs are rats', 'All rats are dogs', 'No dog is a rat', 'None of these'], 3);
select pg_temp.q(2, 'All doctors are graduates. Ravi is not a graduate. So:', array['Ravi is a doctor', 'Ravi is not a doctor', 'Ravi may be a doctor', 'Cannot say'], 1);

select pg_temp.unit('PGCET-MCA', 'Analytical & Logical Reasoning', 'Seating Arrangement');
select pg_temp.q(1, 'A, B and C sit in a row. B is in the middle and A is to the left of B. Who is at the right end?', array['A', 'B', 'C', 'Cannot say'], 2);
select pg_temp.q(1, 'Five people sit in a row and P is in the middle. How many people sit to the left of P?', array['1', '2', '3', '4'], 1);
select pg_temp.q(1, 'In a row of 10 students, Ravi is 4th from the left. What is his position from the right?', array['6th', '7th', '5th', '8th'], 1);
select pg_temp.q(1, 'A, B, C and D sit around a square table facing the centre. A sits opposite C, and B sits to the right of A. Who sits opposite B?', array['A', 'C', 'D', 'Cannot say'], 2);
select pg_temp.q(1, 'In a queue, Meena is 5th from the front and 6th from the back. How many people are in the queue?', array['11', '9', '12', '10'], 3);
select pg_temp.q(2, 'Six friends sit in a circle facing the centre. How many people sit between a person and the one directly opposite, on either side?', array['1', '2', '3', '0'], 1);
select pg_temp.q(2, 'P, Q, R, S and T sit in a row. R is in the middle, Q is at the left end, T is next to Q, and S is immediately to the right of R. Who is at the right end?', array['S', 'P', 'R', 'T'], 1);
select pg_temp.q(2, 'In a row of 25 students, Arun is 10th from the right. What is his position from the left?', array['15th', '14th', '16th', '17th'], 2);
select pg_temp.q(2, 'A, B, C, D and E sit in a row facing north. D is at the left end, B at the right end, and C exactly in the middle. A sits to the left of E. Who is second from the left?', array['A', 'E', 'C', 'B'], 0);
select pg_temp.q(2, 'Eight people sit at a round table facing the centre. X sits third to the right of Y. How many people sit between them on the shorter side?', array['3', '1', '4', '2'], 3);

select pg_temp.unit('PGCET-MCA', 'Analytical & Logical Reasoning', 'Analogies & Odd One Out');
select pg_temp.q(1, 'Book : Read :: Song : ?', array['Write', 'Sing', 'Dance', 'Paint'], 1);
select pg_temp.q(1, 'Find the odd one out:', array['Apple', 'Mango', 'Carrot', 'Banana'], 2);
select pg_temp.q(1, 'Doctor : Hospital :: Teacher : ?', array['School', 'Court', 'Farm', 'Bank'], 0);
select pg_temp.q(1, 'Find the odd one out:', array['Circle', 'Square', 'Triangle', 'Cube'], 3);
select pg_temp.q(1, 'Hand : Glove :: Foot : ?', array['Hat', 'Sock', 'Shirt', 'Ring'], 1);
select pg_temp.q(2, '3 : 9 :: 5 : ?', array['15', '20', '25', '30'], 2);
select pg_temp.q(2, 'Find the odd one out:', array['17', '19', '21', '23'], 2);
select pg_temp.q(2, 'Pen : Writer :: Brush : ?', array['Singer', 'Painter', 'Carpenter', 'Tailor'], 1);
select pg_temp.q(2, 'Find the odd one out:', array['Mercury', 'Venus', 'Moon', 'Mars'], 2);
select pg_temp.q(2, 'AB : CD :: EF : ?', array['FG', 'HI', 'IJ', 'GH'], 3);

select pg_temp.unit('PGCET-MCA', 'Computer Awareness', 'Computer Fundamentals');
select pg_temp.q(1, 'Who is known as the father of the computer?', array['Charles Babbage', 'Alan Turing', 'Bill Gates', 'Tim Berners-Lee'], 0);
select pg_temp.q(1, 'Which of these is an output device?', array['Mouse', 'Scanner', 'Monitor', 'Keyboard'], 2);
select pg_temp.q(1, 'Which device stores data permanently?', array['RAM', 'Hard disk', 'Cache', 'Register'], 1);
select pg_temp.q(1, 'USB stands for:', array['Uniform Serial Bus', 'Universal Serial Bus', 'Universal System Bus', 'United Serial Bus'], 1);
select pg_temp.q(1, 'Which of these is NOT a programming language?', array['Python', 'Java', 'C', 'Windows'], 3);
select pg_temp.q(2, 'A compiler:', array['Translates the whole program at once', 'Translates one line at a time while running', 'Stores data', 'Connects to the internet'], 0);
select pg_temp.q(2, 'The smallest unit of data in a computer is:', array['Byte', 'Bit', 'Nibble', 'Word'], 1);
select pg_temp.q(2, 'Which of these is system software?', array['MS Word', 'Photoshop', 'Operating System', 'Chrome'], 2);
select pg_temp.q(2, 'GUI stands for:', array['Graphical User Interface', 'General User Interface', 'Graphical Unit Interface', 'Global User Interface'], 0);
select pg_temp.q(2, '1 GB is approximately:', array['1000 KB', '1024 MB', '1024 KB', '100 MB'], 1);

select pg_temp.unit('PGCET-MCA', 'Computer Awareness', 'Operating Systems & Software');
select pg_temp.q(1, 'Which of these is an operating system?', array['Linux', 'Oracle', 'Python', 'Excel'], 0);
select pg_temp.q(1, 'The main job of an operating system is to:', array['Design websites', 'Manage hardware and software resources', 'Write documents', 'Edit photos'], 1);
select pg_temp.q(1, 'A file ending in .exe is usually:', array['An image', 'A text file', 'An executable program', 'A video'], 2);
select pg_temp.q(1, 'Which of these is application software?', array['Linux kernel', 'Device driver', 'BIOS', 'MS Excel'], 3);
select pg_temp.q(1, 'Which shortcut copies selected text in Windows?', array['Ctrl + C', 'Ctrl + V', 'Ctrl + X', 'Ctrl + Z'], 0);
select pg_temp.q(2, 'A deadlock happens when:', array['The CPU is idle', 'Processes wait forever for resources held by each other', 'Memory is full', 'A file is deleted'], 1);
select pg_temp.q(2, 'Which scheduling method runs the job that arrived first?', array['Round Robin', 'FCFS', 'SJF', 'Priority'], 1);
select pg_temp.q(2, 'Virtual memory lets a computer:', array['Increase CPU speed', 'Connect to Wi-Fi', 'Use disk space as extra RAM', 'Print faster'], 2);
select pg_temp.q(2, 'Which of these is open-source?', array['Windows', 'macOS', 'Linux', 'iOS'], 2);
select pg_temp.q(2, 'In an operating system, a "process" is:', array['A hardware part', 'A file type', 'A network cable', 'A program in execution'], 3);

select pg_temp.unit('PGCET-MCA', 'Computer Awareness', 'Networking & Internet');
select pg_temp.q(1, 'WWW stands for:', array['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], 0);
select pg_temp.q(1, 'Which device connects different networks together?', array['Monitor', 'Router', 'Keyboard', 'Printer'], 1);
select pg_temp.q(1, 'Every email address contains the symbol:', array['#', '@', '&', '%'], 1);
select pg_temp.q(1, 'LAN stands for:', array['Large Area Network', 'Local Area Network', 'Long Access Network', 'Line Area Network'], 1);
select pg_temp.q(1, 'HTTP is a:', array['Programming language', 'Browser', 'Protocol', 'Virus'], 2);
select pg_temp.q(2, 'Which protocol is used to send email?', array['FTP', 'SMTP', 'HTTP', 'DHCP'], 1);
select pg_temp.q(2, 'An IPv4 address is how long?', array['16 bits', '32 bits', '64 bits', '128 bits'], 1);
select pg_temp.q(2, 'DNS converts:', array['Domain names to IP addresses', 'Files to PDF', 'Text to speech', 'IP addresses to MAC addresses'], 0);
select pg_temp.q(2, 'Which topology connects every device to a central hub?', array['Ring', 'Bus', 'Star', 'Mesh'], 2);
select pg_temp.q(2, 'HTTPS is safer than HTTP because it:', array['Is faster', 'Uses more bandwidth', 'Has no cookies', 'Encrypts the data'], 3);

-- ============================================================
-- MBA
-- ============================================================

select pg_temp.unit('MBA', 'Quantitative Aptitude', 'Percentages & Profit-Loss');
select pg_temp.q(1, '30% of 250 is:', array['65', '70', '75', '80'], 2);
select pg_temp.q(1, 'Bought for ₹800 and sold for ₹1000. The profit percent is:', array['20%', '25%', '200%', '15%'], 1);
select pg_temp.q(1, 'What percent of 80 is 20?', array['20%', '25%', '30%', '40%'], 1);
select pg_temp.q(1, 'A salary of ₹20,000 goes up by 10%. The new salary is:', array['₹21,000', '₹22,000', '₹22,500', '₹30,000'], 1);
select pg_temp.q(1, 'Cost price ₹250, selling price ₹200. The loss percent is:', array['20%', '25%', '50%', '10%'], 0);
select pg_temp.q(2, 'Two successive discounts of 10% and 20% equal a single discount of:', array['30%', '28%', '25%', '32%'], 1);
select pg_temp.q(2, 'A trader marks goods 25% above cost and gives a 10% discount. The profit percent is:', array['15%', '10%', '12.5%', '13.5%'], 2);
select pg_temp.q(2, 'A earns 25% more than B. By what percent is B''s income less than A''s?', array['25%', '20%', '15%', '30%'], 1);
select pg_temp.q(2, 'A population of 10,000 grows by 10% a year. After 2 years it is:', array['12,100', '12,000', '12,200', '11,000'], 0);
select pg_temp.q(2, 'On selling 20 items, the profit equals the cost price of 5 items. The profit percent is:', array['20%', '33.33%', '15%', '25%'], 3);

select pg_temp.unit('MBA', 'Quantitative Aptitude', 'Time, Speed & Distance');
select pg_temp.q(1, 'At 60 km/h for 3 hours, the distance covered is:', array['120 km', '180 km', '200 km', '20 km'], 1);
select pg_temp.q(1, '36 km/h in metres per second is:', array['10 m/s', '12 m/s', '36 m/s', '6 m/s'], 0);
select pg_temp.q(1, '150 km is covered in 3 hours. The speed is:', array['45 km/h', '60 km/h', '50 km/h', '30 km/h'], 2);
select pg_temp.q(1, 'A 100 m long train at 36 km/h crosses a pole in:', array['5 seconds', '10 seconds', '15 seconds', '20 seconds'], 1);
select pg_temp.q(1, 'Walking at 5 km/h, how long does it take to cover 20 km?', array['3 hours', '5 hours', '2 hours', '4 hours'], 3);
select pg_temp.q(2, 'A car goes from A to B at 40 km/h and returns at 60 km/h. The average speed is:', array['50 km/h', '48 km/h', '45 km/h', '52 km/h'], 1);
select pg_temp.q(2, 'Two trains 240 km apart move towards each other at 50 km/h and 70 km/h. They meet after:', array['2 hours', '3 hours', '4 hours', '1.5 hours'], 0);
select pg_temp.q(2, 'A 200 m train at 72 km/h crosses a 300 m platform in:', array['20 seconds', '15 seconds', '25 seconds', '30 seconds'], 2);
select pg_temp.q(2, 'A boat moves at 10 km/h in still water and the stream flows at 2 km/h. Its downstream speed is:', array['8 km/h', '12 km/h', '10 km/h', '20 km/h'], 1);
select pg_temp.q(2, 'If speed goes up by 25%, the time taken for the same distance goes down by:', array['25%', '15%', '30%', '20%'], 3);

select pg_temp.unit('MBA', 'Quantitative Aptitude', 'Simple & Compound Interest');
select pg_temp.q(1, 'Simple interest on ₹1000 at 10% per year for 2 years is:', array['₹100', '₹200', '₹210', '₹150'], 1);
select pg_temp.q(1, 'The simple interest formula is:', array['P × R × T / 100', 'P × R / T', 'P + R + T', 'P(1 + R)^T'], 0);
select pg_temp.q(1, 'Compound interest on ₹1000 at 10% per year for 2 years is:', array['₹200', '₹210', '₹220', '₹110'], 1);
select pg_temp.q(1, '₹500 becomes ₹600 in 2 years at simple interest. The rate is:', array['5%', '20%', '10%', '15%'], 2);
select pg_temp.q(1, 'At what simple interest rate does money double in 10 years?', array['10%', '5%', '20%', '12.5%'], 0);
select pg_temp.q(2, 'The amount on ₹2000 at 5% compound interest for 2 years is:', array['₹2200', '₹2205', '₹2210', '₹2100'], 1);
select pg_temp.q(2, 'The difference between CI and SI on ₹1000 at 10% for 2 years is:', array['₹0', '₹20', '₹10', '₹100'], 2);
select pg_temp.q(2, 'Money doubles in 5 years at simple interest. The rate is:', array['10%', '15%', '20%', '25%'], 2);
select pg_temp.q(2, 'Simple interest for 3 years at 8% is ₹480. The principal is:', array['₹2000', '₹1500', '₹2400', '₹1800'], 0);
select pg_temp.q(2, 'At 10% per year compounded half-yearly, the rate for each half-year is:', array['10%', '20%', '2.5%', '5%'], 3);

select pg_temp.unit('MBA', 'Verbal Ability', 'Vocabulary');
select pg_temp.q(1, 'Synonym of "Ambiguous":', array['Clear', 'Unclear', 'Certain', 'Simple'], 1);
select pg_temp.q(1, 'Antonym of "Optimistic":', array['Pessimistic', 'Hopeful', 'Cheerful', 'Positive'], 0);
select pg_temp.q(1, 'Synonym of "Lethargic":', array['Energetic', 'Active', 'Sluggish', 'Alert'], 2);
select pg_temp.q(1, 'Antonym of "Frugal":', array['Thrifty', 'Careful', 'Economical', 'Wasteful'], 3);
select pg_temp.q(1, 'Synonym of "Concise":', array['Lengthy', 'Brief', 'Wordy', 'Complex'], 1);
select pg_temp.q(2, 'Synonym of "Pragmatic":', array['Idealistic', 'Practical', 'Dreamy', 'Theoretical'], 1);
select pg_temp.q(2, 'Antonym of "Benevolent":', array['Kind', 'Malevolent', 'Generous', 'Caring'], 1);
select pg_temp.q(2, 'Synonym of "Ephemeral":', array['Lasting', 'Eternal', 'Short-lived', 'Ancient'], 2);
select pg_temp.q(2, 'Antonym of "Verbose":', array['Wordy', 'Talkative', 'Concise', 'Lengthy'], 2);
select pg_temp.q(2, 'Synonym of "Resilient":', array['Fragile', 'Weak', 'Rigid', 'Quick to recover'], 3);

select pg_temp.unit('MBA', 'Verbal Ability', 'Idioms & Phrases');
select pg_temp.q(1, '"Break the ice" means:', array['To start a conversation', 'To break something', 'To feel cold', 'To stop talking'], 0);
select pg_temp.q(1, '"A piece of cake" means:', array['A dessert', 'Something very easy', 'A small part', 'A celebration'], 1);
select pg_temp.q(1, '"Hit the books" means:', array['To throw books', 'To study', 'To buy books', 'To write a book'], 1);
select pg_temp.q(1, '"Once in a blue moon" means:', array['Very often', 'Every month', 'Very rarely', 'At night'], 2);
select pg_temp.q(1, '"Burn the midnight oil" means:', array['To waste money', 'To light a lamp', 'To cook at night', 'To work late into the night'], 3);
select pg_temp.q(2, '"Beat around the bush" means:', array['To avoid the main point', 'To clean a garden', 'To fight', 'To hurry'], 0);
select pg_temp.q(2, '"On cloud nine" means:', array['Confused', 'Very happy', 'Very tired', 'In the sky'], 1);
select pg_temp.q(2, '"Bite off more than you can chew" means:', array['To eat too fast', 'To talk too much', 'To take on more than you can handle', 'To save money'], 2);
select pg_temp.q(2, '"Let the cat out of the bag" means:', array['To free a pet', 'To reveal a secret', 'To make a mistake', 'To go shopping'], 1);
select pg_temp.q(2, '"Back to square one" means:', array['To win', 'To move ahead', 'To go home', 'To start again from the beginning'], 3);

select pg_temp.unit('MBA', 'Verbal Ability', 'Error Spotting');
select pg_temp.q(1, 'Which part has an error? "She don''t / like / cold coffee."', array['She don''t', 'like', 'cold coffee', 'No error'], 0);
select pg_temp.q(1, 'Which part has an error? "He is / one of the best player / in the team."', array['He is', 'one of the best player', 'in the team', 'No error'], 1);
select pg_temp.q(1, 'Which part has an error? "The children was / playing / in the park."', array['The children was', 'playing', 'in the park', 'No error'], 0);
select pg_temp.q(1, 'Which part has an error? "He has been living / in Bengaluru / since five years."', array['He has been living', 'in Bengaluru', 'since five years', 'No error'], 2);
select pg_temp.q(1, 'Which part has an error? "The sun / rises / in the east."', array['The sun', 'rises', 'in the east', 'No error'], 3);
select pg_temp.q(2, 'Which part has an error? "Neither the teacher / nor the students / was ready."', array['Neither the teacher', 'nor the students', 'was ready', 'No error'], 2);
select pg_temp.q(2, 'Which part has an error? "She is / more cleverer / than her sister."', array['She is', 'more cleverer', 'than her sister', 'No error'], 1);
select pg_temp.q(2, 'Which part has an error? "The quality of / these mangoes / are poor."', array['The quality of', 'these mangoes', 'are poor', 'No error'], 2);
select pg_temp.q(2, 'Which part has an error? "Him and me / went / to the market."', array['Him and me', 'went', 'to the market', 'No error'], 0);
select pg_temp.q(2, 'Which part has an error? "She has / completed / her project on time."', array['She has', 'completed', 'her project on time', 'No error'], 3);

select pg_temp.unit('MBA', 'Logical Reasoning', 'Number & Letter Series');
select pg_temp.q(1, 'Find the next number: 4, 8, 12, 16, ?', array['18', '20', '22', '24'], 1);
select pg_temp.q(1, 'Find the next letter: B, D, F, H, ?', array['J', 'I', 'K', 'L'], 0);
select pg_temp.q(1, 'Find the next number: 100, 90, 80, 70, ?', array['50', '65', '60', '55'], 2);
select pg_temp.q(1, 'Find the next number: 2, 5, 10, 17, ?', array['24', '25', '27', '26'], 3);
select pg_temp.q(1, 'Find the next pair: AZ, BY, CX, ?', array['DV', 'DW', 'EW', 'DX'], 1);
select pg_temp.q(2, 'Find the next number: 1, 2, 6, 24, 120, ?', array['600', '720', '240', '840'], 1);
select pg_temp.q(2, 'Find the next number: 3, 5, 9, 17, 33, ?', array['64', '66', '65', '49'], 2);
select pg_temp.q(2, 'Find the next group: ACE, BDF, CEG, ?', array['DFH', 'DEF', 'CFH', 'DGI'], 0);
select pg_temp.q(2, 'Find the next number: 2, 3, 5, 9, 17, ?', array['31', '32', '33', '34'], 2);
select pg_temp.q(2, 'Find the next number: 0, 3, 8, 15, 24, ?', array['30', '33', '36', '35'], 3);

select pg_temp.unit('MBA', 'Logical Reasoning', 'Direction Sense');
select pg_temp.q(1, 'The sun rises in the:', array['West', 'East', 'North', 'South'], 1);
select pg_temp.q(1, 'You face south and turn left. Which direction are you facing now?', array['East', 'West', 'North', 'South'], 0);
select pg_temp.q(1, 'You walk 4 km east and then 3 km north. How far are you from the start?', array['7 km', '5 km', '1 km', '12 km'], 1);
select pg_temp.q(1, 'Which direction is opposite to North-West?', array['North-East', 'South-West', 'South-East', 'East'], 2);
select pg_temp.q(1, 'You face west and turn around (180°). Which direction are you facing now?', array['North', 'South', 'West', 'East'], 3);
select pg_temp.q(2, 'Anil walks 6 km north, turns right and walks 8 km. How far is he from the start?', array['14 km', '10 km', '2 km', '12 km'], 1);
select pg_temp.q(2, 'You face north and turn 135° clockwise. Which direction are you facing now?', array['South-East', 'South-West', 'North-East', 'East'], 0);
select pg_temp.q(2, 'In the evening, your shadow falls directly behind you. Which direction are you facing?', array['East', 'West', 'North', 'South'], 1);
select pg_temp.q(2, 'Sita walks 5 km south, then 5 km west, then 5 km north. In which direction is her starting point now?', array['West', 'North', 'East', 'South'], 2);
select pg_temp.q(2, 'A clock is placed so that 12 points north. At 3:00, the hour hand points:', array['West', 'South', 'North', 'East'], 3);

select pg_temp.unit('MBA', 'Logical Reasoning', 'Statement & Conclusion');
select pg_temp.q(1, 'Statement: All students in the class passed. Conclusion: Rahul, a student of the class, passed.', array['Follows', 'Does not follow', 'Cannot say', 'Partly follows'], 0);
select pg_temp.q(1, 'Statement: Regular exercise keeps people healthy. Conclusion: People who exercise regularly tend to be healthier.', array['Does not follow', 'Follows', 'Cannot say', 'The opposite is true'], 1);
select pg_temp.q(1, 'Statement: The shop is closed on Sundays. Conclusion: The shop is definitely open on Monday.', array['Follows', 'Does not follow', 'The shop never opens', 'The shop opens only on Sunday'], 1);
select pg_temp.q(1, 'Statement: Some fruits are sour. Conclusion: All fruits are sour.', array['Follows', 'Partly follows', 'Does not follow', 'Cannot say'], 2);
select pg_temp.q(1, 'Statement: Smoking harms health. Course of action: Print warnings on cigarette packets.', array['Not logical', 'Irrelevant', 'Harmful', 'Logical'], 3);
select pg_temp.q(2, 'Statement: Fuel prices have gone up. Conclusion: Transport costs may rise.', array['Follows', 'Does not follow', 'Cannot say', 'The opposite is true'], 0);
select pg_temp.q(2, 'Statement: Only graduates can apply for this post. Conclusion: Ravi, a Class 12 student, can apply.', array['Follows', 'Does not follow', 'Cannot say', 'Partly follows'], 1);
select pg_temp.q(2, 'Statement: Most successful people wake up early. Conclusion: Everyone who wakes up early is successful.', array['Follows', 'Partly follows', 'Does not follow', 'Must be true'], 2);
select pg_temp.q(2, 'Statement: Trains are cancelled due to heavy rain. Assumption: Heavy rain can affect train services.', array['Not implicit', 'Implicit', 'Irrelevant', 'False'], 1);
select pg_temp.q(2, 'Statement: City libraries will now stay open till 10 pm. Conclusion: Some people want to use the library in the evening.', array['Does not follow', 'Cannot say', 'Irrelevant', 'Follows'], 3);

select pg_temp.unit('MBA', 'General Knowledge', 'Indian Economy & Business');
select pg_temp.q(1, 'The central bank of India is:', array['SBI', 'RBI', 'SEBI', 'NABARD'], 1);
select pg_temp.q(1, 'The currency of Japan is the:', array['Yuan', 'Won', 'Yen', 'Ringgit'], 2);
select pg_temp.q(1, 'GDP stands for:', array['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Global Domestic Product'], 0);
select pg_temp.q(1, 'SEBI regulates the:', array['Banks', 'Securities market', 'Insurance sector', 'Railways'], 1);
select pg_temp.q(1, 'The headquarters of the RBI is in:', array['New Delhi', 'Kolkata', 'Chennai', 'Mumbai'], 3);
select pg_temp.q(2, 'GST was introduced in India in:', array['2014', '2016', '2017', '2019'], 2);
select pg_temp.q(2, 'Who presents the Union Budget in Parliament?', array['RBI Governor', 'Finance Minister', 'Prime Minister', 'President'], 1);
select pg_temp.q(2, 'Inflation means:', array['A general rise in prices', 'A fall in prices', 'A rise in exports', 'A rise in employment'], 0);
select pg_temp.q(2, 'The Bombay Stock Exchange (BSE) is in:', array['Delhi', 'Chennai', 'Mumbai', 'Kolkata'], 2);
select pg_temp.q(2, 'NITI Aayog replaced the:', array['Finance Commission', 'RBI', 'Election Commission', 'Planning Commission'], 3);

select pg_temp.unit('MBA', 'General Knowledge', 'Static GK (India)');
select pg_temp.q(1, 'The capital of Karnataka is:', array['Mysuru', 'Bengaluru', 'Hubballi', 'Mangaluru'], 1);
select pg_temp.q(1, 'The national animal of India is the:', array['Lion', 'Elephant', 'Tiger', 'Peacock'], 2);
select pg_temp.q(1, 'The longest river in India is the:', array['Ganga', 'Godavari', 'Yamuna', 'Krishna'], 0);
select pg_temp.q(1, 'Who wrote "Jana Gana Mana"?', array['Bankim Chandra Chatterjee', 'Rabindranath Tagore', 'Sarojini Naidu', 'Mahatma Gandhi'], 1);
select pg_temp.q(1, 'The highest peak located in India is:', array['Mount Everest', 'Nanda Devi', 'Anamudi', 'Kangchenjunga'], 3);
select pg_temp.q(2, 'Which state is known as the "Land of Five Rivers"?', array['Punjab', 'Haryana', 'Gujarat', 'Bihar'], 0);
select pg_temp.q(2, 'Mysore Palace is in:', array['Kerala', 'Karnataka', 'Tamil Nadu', 'Goa'], 1);
select pg_temp.q(2, 'ISRO has its headquarters in:', array['Hyderabad', 'Chennai', 'Bengaluru', 'Thiruvananthapuram'], 2);
select pg_temp.q(2, 'How many states does India have?', array['26', '28', '29', '30'], 1);
select pg_temp.q(2, 'Kathakali is a classical dance form of:', array['Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'Kerala'], 3);

select pg_temp.unit('MBA', 'General Knowledge', 'Indian Polity');
select pg_temp.q(1, 'The Constitution of India came into effect on:', array['15 August 1947', '26 January 1950', '26 November 1949', '2 October 1950'], 1);
select pg_temp.q(1, 'Who chaired the Drafting Committee of the Constitution?', array['Jawaharlal Nehru', 'B. R. Ambedkar', 'Rajendra Prasad', 'Sardar Patel'], 1);
select pg_temp.q(1, 'Members of the Lok Sabha are elected for:', array['4 years', '6 years', '5 years', '3 years'], 2);
select pg_temp.q(1, 'The constitutional head of India is the:', array['President', 'Prime Minister', 'Chief Justice', 'Speaker'], 0);
select pg_temp.q(1, 'Fundamental Rights are in which Part of the Constitution?', array['Part I', 'Part II', 'Part IV', 'Part III'], 3);
select pg_temp.q(2, 'The minimum age to become President of India is:', array['25', '30', '35', '40'], 2);
select pg_temp.q(2, 'The Rajya Sabha is also called the:', array['House of the People', 'Council of States', 'Lower House', 'Legislative Assembly'], 1);
select pg_temp.q(2, 'The Directive Principles of State Policy are in:', array['Part III', 'Part IV', 'Part V', 'Part VI'], 1);
select pg_temp.q(2, 'The Right to Education comes under Article:', array['19', '32', '21A', '14'], 2);
select pg_temp.q(2, 'Who appoints the Chief Justice of India?', array['Prime Minister', 'Law Minister', 'Parliament', 'President'], 3);
