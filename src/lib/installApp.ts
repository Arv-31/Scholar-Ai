// "Install ScholarAI" support (PWA). Chrome/Edge/Android fire `beforeinstallprompt` once, early,
// so we catch it as soon as this file loads and keep it until the student taps Install.
// iPhones never fire it: there the student uses Share -> Add to Home Screen (we show that hint).

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let saved: InstallEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault() // we show our own button instead of the browser's mini bar
    saved = event as InstallEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    saved = null
    notify()
  })
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const canInstall = (): boolean => saved !== null

// Already opened from the home screen icon?
export function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// Shows the browser's install dialog. Returns true if the student accepted.
export async function promptInstall(): Promise<boolean> {
  if (!saved) return false
  const event = saved
  saved = null
  notify()
  await event.prompt()
  const { outcome } = await event.userChoice
  return outcome === 'accepted'
}

// Registers public/sw.js (built site only; in `npm run dev` it would cache files while editing).
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // no offline support then; the site still works normally
    })
  })
}
