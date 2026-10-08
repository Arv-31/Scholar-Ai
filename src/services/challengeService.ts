import { pickDailyChallenges } from '../lib/challenges'
import { supabase } from '../lib/supabaseClient'
import type { Challenge, Profile } from '../types/database'

export type TodaysChallenges = { challenges: Challenge[]; doneIds: number[] }

export async function getTodaysChallenges(day: string): Promise<TodaysChallenges> {
  const [all, done] = await Promise.all([
    supabase.from('challenges').select('id, text'),
    supabase.from('challenge_completions').select('challenge_id').eq('day', day),
  ])
  if (all.error) throw new Error('Could not load today’s tasks.')

  return {
    challenges: pickDailyChallenges(all.data as Challenge[], day),
    doneIds: ((done.data ?? []) as { challenge_id: number }[]).map((row) => row.challenge_id),
  }
}

// Marks a task done. The database also updates the streak and returns the new profile.
export async function completeChallenge(challengeId: number, day: string): Promise<Profile> {
  const { data, error } = await supabase.rpc('record_challenge', {
    p_challenge_id: challengeId,
    p_day: day,
  })
  if (error) throw new Error('Could not save that. Try again.')
  return data as Profile
}

// How many tasks were done on each day since `fromDay`, e.g. { '2026-10-08': 2 }.
export async function getCompletionCounts(fromDay: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('challenge_completions')
    .select('day')
    .gte('day', fromDay)
  if (error) throw new Error('Could not load your history.')

  const counts: Record<string, number> = {}
  for (const row of data as { day: string }[]) counts[row.day] = (counts[row.day] ?? 0) + 1
  return counts
}
