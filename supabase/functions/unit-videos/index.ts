// Returns the YouTube videos for one unit.
// First visit: searches YouTube with the PROJECT key (secret YOUTUBE_API_KEY) and saves the results.
// After that: everyone gets the saved list, so we use the YouTube quota only once per unit.
import { z } from 'npm:zod@4'
import { admin, getUser } from '../_shared/auth.ts'
import { corsHeaders, fail, json } from '../_shared/cors.ts'

const Input = z.object({ unitId: z.uuid() })

const COLUMNS = 'id, unit_id, youtube_video_id, title, channel_title, thumbnail_url'

type SearchItem = {
  id: { videoId?: string }
  snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } }
}

// YouTube sends titles with HTML entities like &amp; and &#39;
function decode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const user = await getUser(req)
  if (!user) return fail('UNAUTHORIZED', 'Please sign in again.', 401)

  const parsed = Input.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('BAD_INPUT', 'The request was not valid.')
  const { unitId } = parsed.data

  const saved = await admin.from('unit_videos').select(COLUMNS).eq('unit_id', unitId).order('sort_order')
  if (saved.data && saved.data.length > 0) return json({ videos: saved.data })

  const apiKey = Deno.env.get('YOUTUBE_API_KEY')
  if (!apiKey) return fail('NO_YOUTUBE_KEY', 'Videos are not set up yet.', 503)

  const { data: unit } = await admin
    .from('units')
    .select('name, subjects(name, exams(code))')
    .eq('id', unitId)
    .maybeSingle()
  if (!unit) return fail('NOT_FOUND', 'Unit not found.', 404)

  // deno-lint-ignore no-explicit-any
  const subject = (unit as any).subjects
  const query = `${unit.name} ${subject?.name ?? ''} ${subject?.exams?.code ?? ''} preparation`

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '6',
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    relevanceLanguage: 'en',
    q: query,
    key: apiKey,
  }).toString()

  const res = await fetch(url)
  if (!res.ok) return fail('YOUTUBE_FAILED', 'Could not load videos right now.', 502)
  const body = (await res.json()) as { items?: SearchItem[] }

  const rows = (body.items ?? [])
    .filter((item) => item.id.videoId)
    .map((item, index) => ({
      unit_id: unitId,
      youtube_video_id: item.id.videoId!,
      title: decode(item.snippet.title),
      channel_title: decode(item.snippet.channelTitle),
      thumbnail_url: item.snippet.thumbnails?.medium?.url ?? null,
      sort_order: index,
    }))

  if (rows.length > 0) {
    await admin
      .from('unit_videos')
      .upsert(rows, { onConflict: 'unit_id,youtube_video_id', ignoreDuplicates: true })
  }

  const fresh = await admin.from('unit_videos').select(COLUMNS).eq('unit_id', unitId).order('sort_order')
  return json({ videos: fresh.data ?? [] })
})
