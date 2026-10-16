// The "just logged in" flag that makes the home page open through a circle (see LandingReveal).
// Kept in sessionStorage so it survives the Google sign-in redirect, and used once.

export const LANDING_FLAG = 'scholarai:justLoggedIn'

export type Landing = { x: number; y: number; fade: boolean; bright: boolean }

export function readLanding(): Landing | null {
  try {
    const raw = sessionStorage.getItem(LANDING_FLAG)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<Landing>
    return {
      x: value.x ?? window.innerWidth / 2,
      y: value.y ?? window.innerHeight / 2,
      fade: Boolean(value.fade) || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      bright: Boolean(value.bright), // opening out of the blast of light (else out of the night sky)
    }
  } catch {
    return null
  }
}

export function setLanding(value: Partial<Landing>) {
  try {
    sessionStorage.setItem(LANDING_FLAG, JSON.stringify(value))
  } catch {
    // storage blocked: the page simply appears without the reveal
  }
}

export function clearLanding() {
  try {
    sessionStorage.removeItem(LANDING_FLAG)
  } catch {
    // ignore
  }
}
