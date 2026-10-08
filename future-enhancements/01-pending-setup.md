# 01 · Pending setup (things we skipped)

These are already coded. They only need a key, a dashboard setting, or a human check.

## 1. YouTube videos (Must)

**Now:** the Unit page says "Videos are not set up yet" because the `unit-videos` Edge Function
has no `YOUTUBE_API_KEY` secret.

**How:**
1. Google Cloud Console → your project → APIs & Services → Library → enable **YouTube Data API v3**.
2. Credentials → Create credentials → API key. Restrict it: API restrictions → YouTube Data API v3 only.
3. Add it as a secret (type it yourself in PowerShell, never paste it in chat):
   ```
   npx supabase secrets set YOUTUBE_API_KEY=your_key_here
   ```
4. Open any unit on the live site. First visit searches YouTube and saves results in the DB;
   every student after that gets the saved list (no extra API cost).

**Viva line:** the key lives only in Supabase secrets, never in the browser. One search per unit,
shared by everyone, keeps us inside the free 10,000 units/day quota.

## 2. Google sign-in (Must)

**Now:** the "Continue with Google" button exists but the provider is not switched on.

**How:**
1. Google Cloud Console → APIs & Services → OAuth consent screen → External → fill app name,
   support email → add your test users (or publish).
2. Credentials → Create OAuth client ID → Web application.
   - Authorised redirect URI: `https://xsgomwaszkttqsuxvhcy.supabase.co/auth/v1/callback`
3. Supabase dashboard → Authentication → Sign In / Providers → Google → paste Client ID + Secret → Save.
4. Check URL Configuration still has the live site in Site URL + Redirect URLs.
5. Test on the live site in a private window.

## 3. Content review (Must)

Claude drafted 370 quiz questions (37 units × rounds 1–2) and 16 Comfort Zone tasks.
They must be checked against official outlines before the review.

**How:**
1. Download the official syllabus PDFs: NIMCET (nimcet.admissions.nic.in), PGCET-MCA (kea.kar.nic.in),
   and your chosen MBA exam.
2. Supabase dashboard → Table Editor → `units` / `questions`. Filter by unit.
3. For each unit check: topic is in the syllabus · answer is correct · explanation makes sense ·
   difficulty feels exam-like.
4. Fix wrong rows directly in the table editor, or tell Claude the unit name + problem and it
   will write a migration for the fix.
5. Keep a short list "units reviewed: x / 37" — good proof for lecturers.

## 4. Claude for the chatbot (Optional, only if you get a key)

**How:** one line in `supabase/functions/_shared/aiRouting.ts`:
```ts
chat: { provider: 'claude', model: 'claude-sonnet-5-5' },
```
then `npx supabase secrets set ANTHROPIC_API_KEY=...` and
`npx supabase functions deploy ai`. No page changes — that is the whole point of the routing config.

## 5. Supabase URL settings (done 2026-10-09, just re-check)

Authentication → URL Configuration:
- Site URL: `https://scholarai.scholarai.workers.dev`
- Redirect URLs: `https://scholarai.scholarai.workers.dev/**` and `http://localhost:5173/**`
