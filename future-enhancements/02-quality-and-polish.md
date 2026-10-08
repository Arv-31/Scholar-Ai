# 02 · Quality and polish

Small gaps a lecturer could notice during the demo.

## 1. Forgot password (Must)

**Missing:** there is no way to reset a password today.

**How:**
1. `src/services/authService.ts` → add
   - `sendPasswordReset(email)` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: <site>/reset-password })`
   - `updatePassword(newPassword)` → `supabase.auth.updateUser({ password })`
2. `src/pages/Login.tsx` → small "Forgot password?" link under the password field.
3. New page `src/pages/ResetPasswordPage.tsx` (new password + confirm, Zod check: min 8 chars, both match).
4. Add the route in `src/App.tsx` (public route, not inside ProtectedRoute).
5. Test: request reset → open email → set new password → log in.

## 2. Faster first load — code-splitting (Should)

**Now:** one JS file of ~580 KB (Vite warns above 500 KB).

**How:** in `src/App.tsx` load heavy pages lazily:
```tsx
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
```
Wrap the routes in `<Suspense fallback={<LoadingScreen />}>`. Each page then downloads only when
opened. Run `npm run build` and compare chunk sizes before/after (nice slide for the viva).

## 3. More tests (Should)

**Now:** 12 tests, all in `src/lib/lib.test.ts` (dates, streak, quiz helpers).

**Add:**
- Unit-complete rule: 59% → not complete, 60% → complete, best of two rounds counts.
- Streak: one task done = no streak day; both done = streak +1; missed day = reset.
- Zod schemas: bad email / short password rejected.
- Services with a mocked Supabase client (e.g. `quizService` saves a score with the right unit id).

Run with `npm test`. Show the green output in the viva.

## 4. UI polish pass (Should)

- Check every page at 1366×768 (college projector size) and at phone width.
- Empty states: no Gemini key, no videos, no internet — each should say what to do next.
- Keyboard: Tab through login and quiz; focus ring visible.
- `prefers-reduced-motion`: turn off big animations for users who ask for less motion.
- Favicon + page `<title>` per route ("Quiz · ScholarAI").

## 5. Final deploy checklist (Day 10)

1. `npm run lint` → clean
2. `npm test` → all pass
3. `npm run deploy`
4. Private window → live site → demo account → click every page in both modes
5. Try one Round 3 quiz and one chatbot question with a Gemini key
6. `git push`
