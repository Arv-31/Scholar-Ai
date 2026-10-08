import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import type { UnitVideo } from '../types/database'
import { callFunction } from './functionsClient'
import { currentUserId } from './profileService'

const VideosResponse = z.object({
  videos: z.array(
    z.object({
      id: z.string(),
      unit_id: z.string(),
      youtube_video_id: z.string(),
      title: z.string(),
      channel_title: z.string().nullable(),
      thumbnail_url: z.string().nullable(),
    }),
  ),
})

// Videos for a unit. The server searches YouTube only the first time, then reuses the saved list.
export async function getUnitVideos(unitId: string): Promise<UnitVideo[]> {
  const result = await callFunction('unit-videos', { unitId }, VideosResponse)
  return result.videos
}

// How much of each video the student has watched (0-100), keyed by video id.
export async function getMyWatch(videoIds?: string[]): Promise<Record<string, number>> {
  let query = supabase.from('video_watch').select('video_id, watched_percent')
  if (videoIds) query = query.in('video_id', videoIds)
  const { data } = await query

  const result: Record<string, number> = {}
  for (const row of (data ?? []) as { video_id: string; watched_percent: number }[]) {
    result[row.video_id] = row.watched_percent
  }
  return result
}

export async function saveWatch(videoId: string, percent: number): Promise<void> {
  const userId = await currentUserId()
  if (!userId) return
  await supabase.from('video_watch').upsert(
    {
      user_id: userId,
      video_id: videoId,
      watched_percent: Math.max(0, Math.min(100, Math.round(percent))),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,video_id' },
  )
}
