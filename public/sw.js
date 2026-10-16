// ScholarAI service worker: makes the installed app open fast and still open when offline.
//   Pages (navigation)  -> network first; offline -> the saved app shell (index.html).
//   /assets/*  (built JS/CSS, names change every build) -> cache first, they never change.
//   Icons, fonts        -> cache first.
//   Supabase, Gemini, YouTube -> never touched here: live data always comes from the network.
const CACHE = 'scholarai-v1'
const SHELL = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
  self.skipWaiting()
})

// Remove caches from older versions of this file.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Opening a page: try the network (fresh deploys), fall back to the saved shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  const sameSite = url.origin === self.location.origin
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  const staticFile =
    sameSite && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))

  if (staticFile || fonts) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok || response.type === 'opaque') {
              const copy = response.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
  // Everything else (Supabase, AI, YouTube): the browser handles it normally.
})
