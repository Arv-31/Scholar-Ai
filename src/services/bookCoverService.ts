// Real cover images for the daily book picks, from Open Library (free, no key needed).
// Each cover is looked up once per browser and remembered, so the same book is not searched again.

const CACHE_KEY = 'scholarai:bookCovers'

type Doc = { title?: string; cover_i?: number }

function readCache(): Record<string, string | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Record<string, string | null>
  } catch {
    return {}
  }
}

function writeCache(key: string, url: string | null) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [key]: url }))
  } catch {
    // storage blocked: we simply look it up again next time
  }
}

const simple = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

// Returns a cover image URL, or null if Open Library has no cover for this book.
export async function getBookCover(title: string, author: string): Promise<string | null> {
  const key = `${simple(title)}|${simple(author)}`
  const cached = readCache()
  if (key in cached) return cached[key]

  try {
    const params = new URLSearchParams({ title, author, limit: '10', fields: 'title,cover_i' })
    const res = await fetch(`https://openlibrary.org/search.json?${params}`)
    if (!res.ok) return null
    const docs = ((await res.json()) as { docs?: Doc[] }).docs ?? []
    const withCover = docs.filter((d) => d.cover_i)
    const wanted = simple(title)
    // best: the exact title; then a title that starts with it; then any edition with a cover
    const pick =
      withCover.find((d) => simple(d.title ?? '') === wanted) ??
      withCover.find((d) => simple(d.title ?? '').startsWith(wanted)) ??
      withCover[0]
    const url = pick ? `https://covers.openlibrary.org/b/id/${pick.cover_i}-M.jpg` : null
    writeCache(key, url)
    return url
  } catch {
    return null // offline or blocked: the card shows the letter instead
  }
}
