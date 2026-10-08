# 04 · Unique features (edge over other projects)

Most exam-prep projects stop at "quiz + score". These ideas use what ScholarAI already has
(quiz data, Gemini via the `ai` function, videos, streak) so each one is small to build but
easy to show off. All stay inside the project scope (no journal, mood meter, mobile app or RAG).

⭐ = recommended for the 10 days.

## ⭐ 1. Mistake Notebook

Every wrong answer is saved automatically. A "Mistakes" page lists them by unit and lets the
student retry only those. Answer correctly twice → it leaves the notebook.

**Why unique:** turns quizzes into revision, like real toppers' "error logs".
**How:** new table `mistakes (user_id, question_id, wrong_count, right_streak)` + RLS;
`quizService` writes on each wrong answer; new page `MistakesPage.tsx` reusing the quiz UI.

## ⭐ 2. "Why was I wrong?" button

After a wrong answer, one tap asks Gemini to explain why the chosen option is wrong and the
correct one is right, in 3 short lines.

**Why unique:** personal explanation of *your* mistake, not a generic answer key.
**How:** add task `explain` in `aiRouting.ts`; `aiService.explainMistake(question, chosen, correct)`;
uses the student's own Gemini key (same as round 3). Show the key empty state if no key.

## ⭐ 3. Timed mock test with real exam rules

Full mock that copies the real exam: fixed time, sections, and **negative marking**
(e.g. NIMCET: Maths +12 / −3, Reasoning and Computer +6 / −1.5, English +4 / −1). Shows the score, accuracy, and
"marks lost to guessing".

**Why unique:** students practise strategy (when to skip), not just knowledge.
**How:** `exam_rules` config in `src/lib/` (time, marks per correct/wrong per exam); `MockTestPage.tsx`
draws questions across units from existing seeded data; save result in `mock_attempts`.
Check the exact marking scheme from the official notice before building.

## 4. Exam countdown + daily target

Student sets their exam date. Home shows "38 days left" and a suggested target
("finish 1 unit a day to cover everything").

**How:** `exam_date` column on `profiles`; simple maths in `src/lib/`; one card on `ExamHome.tsx`.

## 5. Weak-topic heatmap

Progress page grid: one square per unit, colour by best score (grey = not tried, ember = weak,
green = strong). Click a square → open that unit.

**Why unique:** one look shows the whole syllabus strength. Great on a projector.
**How:** data already exists (unit scores); just a new component on `ProgressPage.tsx`.

## 6. Watch-then-check

When a video reaches 80% watched, offer a 3-question quick check on that unit.

**Why unique:** links videos and quizzes, uses the watch-% tracking we already built.
**How:** `VideoPlayer.tsx` already reports watch %; at ≥ 80% show a button that opens round 1
questions in a short mode.

## 7. Kannada explanations toggle

Chatbot and "Why was I wrong?" can answer in Kannada or English (setting toggle).

**Why unique:** fits PGCET (a Karnataka exam) students; almost no project does regional language.
**How:** a `language` setting on `profiles`; pass it to the `ai` function and add one line to
the prompt ("Reply in simple Kannada"). Gemini handles Kannada well.

## 8. Shareable streak card

Button that creates a nice image: "🔥 12-day streak on ScholarAI" with the mode colours.

**How:** draw on a `<canvas>` and download as PNG (no server needed).

## How to pitch these in the review

"ScholarAI doesn't just test the student — it remembers their mistakes, explains them personally,
trains exam strategy with real marking rules, and supports Kannada for Karnataka students."
