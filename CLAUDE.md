# ScholarAI

BCA final-year project (KLE S. Nijalingappa College). Synopsis: `docs/kle_snc_synopsis (2).pdf`.
Deadline: Review 3 (full working project) by end of October 2026. Web only, desktop first.

## Goal
AI-assisted entrance exam prep plus light habit building. Two modes in one account (Default / Exam toggle).
- **Exam Mode:** choose exam → subjects → units; quizzes; chatbot; YouTube videos per unit; unit progress.
- **Default Mode:** 2 Comfort Zone tasks a day, daily fiction + non-fiction book picks, streak counter.
- **Out of scope:** journal, mood meter, mobile app, RAG, anything not listed here.

## Stack (locked)
React 19 + Vite + TypeScript, React Router, React Context, Tailwind, Zod, Vitest.
Supabase (Postgres, Auth: email/password + Google, Edge Functions). Gemini (BYOK), Claude (later),
YouTube Data API + IFrame Player. Deploy: **Cloudflare Workers** (Wrangler, static assets), not Pages.

## Architecture rules (permanent)
- Screens never call Supabase, Gemini, Claude or YouTube directly. Everything goes through `src/services/`.
- One small AI routing config (task → provider). Changing a provider must not mean rewriting pages.
- No RAG now, but the AI service has a retrieve step so RAG can plug in later
  (retrieve, then call the same model) without changing screens or the routing shape.
- Keys only in `.env` (gitignored) or Edge Function secrets. Never print, log or commit keys.
  Never ask the user to paste keys in chat.

## Design
Light theme, unique + futuristic + minimal, responsive (desktop sidebar; mobile top bar + floating bottom menu).
Ink `#12151B`, green `#2F9E63`, ember `#E08A3C`; Fraunces (headings) + Space Grotesk (body).
Tokens + helpers (`card`, `field`, `btn-primary`, `eyebrow`, `grid-lines`) live in `src/index.css`.
Default mode = ember accent, Exam mode = green accent. Code style: no semicolons (matches existing code).

## Decisions (user approved)
1. **Books:** generated when the student first opens Default Mode that day, with THEIR Gemini key; cached
   for that day. No nightly job. No key → clear empty state.
2. **Student Gemini key:** stored in Supabase on their account (follows login). Never logged. UI shows only
   a masked form (`AIza…xxxx`). Claude key lives only in Edge Function secrets, never in a user row or frontend.
3. **Content:** Claude drafts subjects/units, quiz questions and Comfort Zone tasks; the user reviews them
   against official outlines before the college review.
   - Exams: NIMCET, PGCET-MCA, MBA (quant, verbal, logical, GK). No GATE/CAT for now.
   - Quiz: rounds 1–2 predefined, 5 questions per round per unit. Round 3 = live Gemini BYOK on weak topics.
   - Comfort Zone: 2 tasks/day from a short rotating list. Grounded student-life tone; no hustle/cringe wording.
4. **Unit complete:** only when the student scores ≥ 60% on at least one completed round for that unit.
   No manual tick. Show the last score.
5. **YouTube:** search once per unit with the PROJECT key (Edge Function secret, never `VITE_`, never in the
   browser), save results in the DB, shared by all students. Play in-app via IFrame Player; track watch %.
6. **Synopsis extras included:** Google Sign-In + email/password, streak, Zod, Vitest, Tailwind (themed),
   watch-% tracking. Added across stages, not all at once.
7. **Hosting:** Cloudflare Workers. Supabase Edge Functions hold server secrets.
8. **Keys/CLI:** Supabase CLI v2.120.0 installed. No Claude key yet → chatbot uses Gemini now via the routing
   config; later switch = set chatbot → claude + add the Edge Function secret. Google OAuth client is in the
   user's Google Cloud project + Supabase Google provider (not needed for Stage 1).
9. **Streak:** a day counts when the student finishes BOTH Comfort Zone tasks that day.
10. **Chatbot:** no saved chat history (kept only while the page is open).
11. **AI calls:** all go through one Edge Function `ai` → routing config in
    `supabase/functions/_shared/aiRouting.ts` → retrieve() (no-op, RAG hook) → provider.

## Layout
`src/services/` (only place touching Supabase/AI) · `src/lib/supabaseClient.ts` · `src/context/` (auth) ·
`src/hooks/` · `src/components/` (AppShell, ModeToggle, ProtectedRoute…) · `src/pages/` · `src/types/` ·
`supabase/migrations/` (schema + RLS). Routes are all in `src/App.tsx`.

## Working style
- Stages; before each: plan + screen preview, then WAIT for "yes". Never build before approval.
- After each: how to test + plain-English explanation of each file (user must explain it in the viva).
- User is early-intermediate and writes casually; read for meaning, ask when unsure, don't guess.

## Commands
`npm run dev` · `npm run build` · `npm run lint`

## Commands (extra)
`npm test` (Vitest) · `npm run deploy` (build + wrangler deploy)

## Build progress
- [x] Step 0: synopsis + code read, CLAUDE.md written, decisions recorded
- 2026-10-08: user asked to "complete the whole project" in one go (stages 1–8 built together).
  Code done, builds, lint clean, 12 tests pass, Edge Functions pass `deno check`.
  NOT yet done (needs user): `supabase db push`, set YOUTUBE_API_KEY secret, deploy 3 functions,
  add redirect URLs, test in browser, review seeded questions, `npm run deploy`.
- [x] 1. Foundation (old starter files deleted)
- [x] 2. Auth (+ Google button) + streak (`record_challenge` RPC)
- [x] 3. Exam Mode browsing + progress
- [x] 4. Quizzes (rounds 1–2 seeded: 37 units × 10 Qs; round 3 via `ai` function)
- [x] 5. Chatbot + YouTube (`unit-videos` function) with watch %
- [x] 6. Default Mode tasks + books
- [x] 7. Progress page
- [~] 8. States + tests + wrangler.jsonc done; deploy pending
