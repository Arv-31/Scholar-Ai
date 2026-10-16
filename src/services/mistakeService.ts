import { supabase } from '../lib/supabaseClient'
import type { AnswerRecord } from '../types/database'

// Mistake notebook. The list comes from wrong answers already saved with each quiz attempt;
// the mistake_reviews table only remembers revision progress (right twice in a row = cleared).

export const CLEAR_AFTER = 2

export type Mistake = {
  unitId: string
  question: string
  options: string[]
  correct: number
  rightStreak: number
}

export type MistakeGroup = { unitId: string; unitName: string; mistakes: Mistake[] }

type AttemptRow = {
  unit_id: string
  created_at: string
  answers: AnswerRecord[] | null
  units: { name: string } | null
}
type ReviewRow = {
  unit_id: string
  question: string
  right_streak: number
  cleared: boolean
  updated_at: string
}

export async function getMistakes(): Promise<MistakeGroup[]> {
  const [attempts, reviews] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('unit_id, created_at, answers, units(name)')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('mistake_reviews').select('unit_id, question, right_streak, cleared, updated_at'),
  ])
  if (attempts.error) throw new Error('Could not load your mistakes.')
  // before the study-tools migration this table does not exist: no progress yet
  const reviewRows = (reviews.error ? [] : reviews.data) as ReviewRow[]
  const reviewOf = new Map(reviewRows.map((r) => [`${r.unit_id}|${r.question}`, r]))

  const latestWrong = new Map<string, { at: string; mistake: Mistake; unitName: string }>()
  for (const attempt of attempts.data as unknown as AttemptRow[]) {
    for (const a of attempt.answers ?? []) {
      if (a.chosen === a.correct) continue
      const key = `${attempt.unit_id}|${a.question}`
      if (latestWrong.has(key)) continue // attempts are newest first
      latestWrong.set(key, {
        at: attempt.created_at,
        unitName: attempt.units?.name ?? 'Unit',
        mistake: {
          unitId: attempt.unit_id,
          question: a.question,
          options: a.options,
          correct: a.correct,
          rightStreak: 0,
        },
      })
    }
  }

  const groups = new Map<string, MistakeGroup>()
  for (const [key, { at, mistake, unitName }] of latestWrong) {
    const review = reviewOf.get(key)
    // cleared after the last time it was answered wrong in a quiz = out of the notebook
    if (review?.cleared && review.updated_at > at) continue
    if (review && review.updated_at > at) mistake.rightStreak = review.right_streak
    const group = groups.get(mistake.unitId) ?? { unitId: mistake.unitId, unitName, mistakes: [] }
    group.mistakes.push(mistake)
    groups.set(mistake.unitId, group)
  }
  return [...groups.values()].sort((a, b) => b.mistakes.length - a.mistakes.length)
}

// Saves one revision answer. Returns false if progress could not be saved (e.g. before the update).
export async function recordReview(mistake: Mistake, right: boolean): Promise<boolean> {
  const streak = right ? mistake.rightStreak + 1 : 0
  const { error } = await supabase.from('mistake_reviews').upsert(
    {
      unit_id: mistake.unitId,
      question: mistake.question,
      right_streak: streak,
      cleared: streak >= CLEAR_AFTER,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,unit_id,question' },
  )
  return !error
}
