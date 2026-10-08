# 03 · Login stardust animation

**Idea:** after a successful login, the screen bursts into tiny glowing particles (stardust),
they drift outward and fade, the overlay turns transparent, and the home page is revealed
underneath. About 1.2 seconds. Should feel futuristic but calm, not flashy.

## What the student sees

```
 [ Login card ]          ✦ · ✧ · ✦             · ✧   ·            ┌──────────────┐
  email ____     click    ·  BURST  ·   fade     ·      ·   reveal │  Today page  │
  pass  ____   ───────►  ✧ ·  ✦  · ✧  ───────►   ✦   ·   ───────►  │  (home)      │
  [ Sign in ]              · ✦ · ✧               ·    ✧            └──────────────┘
   0 ms                   0–400 ms              400–1200 ms          1200 ms
```

Colours follow the mode: ember `#E08A3C` particles for Default mode, green `#2F9E63` for Exam
mode, with a few white sparks. Background flashes from ink `#12151B` to transparent.

## How to build it (no new library)

1. **New component** `src/components/StardustReveal.tsx`
   - A full-screen `<canvas>` fixed on top of the app (`position: fixed; inset: 0; pointer-events: none`).
   - Creates ~150 particles at the centre of the login button / screen centre.
   - Each particle: random angle, speed, size 1–3 px, colour from the palette, life 0→1.
   - `requestAnimationFrame` loop: move, slow down a bit (friction 0.96), shrink alpha.
   - The canvas wrapper fades `opacity 1 → 0` with a CSS transition, then the component removes itself.
2. **Trigger it only right after login, not on every refresh**
   - In `Login.tsx` after `signIn` succeeds: `sessionStorage.setItem('scholarai:justLoggedIn', '1')`.
   - For Google login, set the same flag just before redirecting to Google; it survives the round trip.
   - In `AppShell.tsx`: if the flag exists → render `<StardustReveal />` once and delete the flag.
3. **Home page reveal**
   - Home content gets a short CSS entrance: `opacity 0 → 1` and `scale(0.98) → 1`, delayed 300 ms,
     so it "appears through" the dust.
   - Keyframes go in `src/index.css` next to the other helpers.
4. **Respect reduced motion**
   - If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` → skip particles, simple fade only.
5. **Keep it light**
   - Canvas, not 150 DOM elements (smooth even on a slow PC).
   - Stop the loop and remove the canvas when finished (no memory left behind).

## Files touched

| File | Change |
| --- | --- |
| `src/components/StardustReveal.tsx` | new — canvas particle burst + fade |
| `src/pages/Login.tsx` | set "just logged in" flag on success |
| `src/components/AppShell.tsx` | show the reveal once when the flag is present |
| `src/index.css` | `reveal-in` keyframes for the home content |

## Viva explanation

"We draw particles on an HTML canvas using requestAnimationFrame. Each frame we update every
particle's position and transparency. A sessionStorage flag makes sure it plays only right after
login. Users who turn on 'reduce motion' in their OS get a plain fade instead."

## Optional extras

- Logout: reverse effect (home dissolves into dust, login card forms).
- Streak milestone (7, 30 days): small stardust burst around the streak counter.
