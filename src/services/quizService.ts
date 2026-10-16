import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { scoreQuiz, toAnswerRecords, type QuizQuestion } from '../lib/quiz'
import type { AnswerRecord, QuizAttempt, Round, Subtopic } from '../types/database'
import { callFunction } from './functionsClient'

// Rounds 1 and 2: the 5 saved questions for this unit.
export async function getRoundQuestions(unitId: string, round: 1 | 2): Promise<QuizQuestion[]> {
  const load = (columns: string) =>
    supabase
      .from('questions')
      .select(columns)
      .eq('unit_id', unitId)
      .eq('round', round)
      .order('sort_order')
  let result = await load('question, options, correct_index, subtopic_id')
  if (result.error) result = await load('question, options, correct_index') // before the subtopics migration
  if (result.error) throw new Error('Could not load the questions.')

  type Row = {
    question: string
    options: string[]
    correct_index: number
    subtopic_id?: string | null
  }
  return (result.data as unknown as Row[]).map((q) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correct_index,
    subtopicId: q.subtopic_id ?? null,
  }))
}

// The subtopics of a unit, in order. Empty if there are none (or before the migration).
export async function getSubtopics(unitId: string): Promise<Subtopic[]> {
  const { data, error } = await supabase
    .from('subtopics')
    .select('id, unit_id, name, sort_order')
    .eq('unit_id', unitId)
    .order('sort_order')
  return error ? [] : (data as Subtopic[])
}

const Round3Response = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().optional(),
        subtopicId: z.string().nullable().optional(),
      }),
    )
    .min(1),
})

// Round 3: 5 fresh questions from Gemini (student's own key), aimed at their weak spots.
export async function generateRound3(unitId: string): Promise<QuizQuestion[]> {
  const result = await callFunction('ai', { task: 'quiz', unitId }, Round3Response)
  return result.questions
}

export async function getQuestions(unitId: string, round: Round): Promise<QuizQuestion[]> {
  return round === 3 ? generateRound3(unitId) : getRoundQuestions(unitId, round)
}

// Saves a finished round. The database works out the percent and unit completion.
export async function saveAttempt(
  unitId: string,
  round: Round,
  questions: QuizQuestion[],
  chosen: number[],
): Promise<void> {
  const { score, total } = scoreQuiz(questions, chosen)
  const { error } = await supabase.from('quiz_attempts').insert({
    unit_id: unitId,
    round,
    score,
    total,
    answers: toAnswerRecords(questions, chosen),
  })
  if (error) throw new Error('Could not save your score.')
}

export type AttemptWithUnit = QuizAttempt & { unit_name: string }

// Latest attempts, newest first. Pass a unitId to see only that unit.
export async function listMyAttempts(options: { unitId?: string; limit?: number } = {}) {
  let query = supabase
    .from('quiz_attempts')
    .select('id, unit_id, round, score, total, percent, created_at, units(name)')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 50)
  if (options.unitId) query = query.eq('unit_id', options.unitId)

  const { data, error } = await query
  if (error) throw new Error('Could not load your attempts.')

  return (data as unknown as (QuizAttempt & { units: { name: string } | null })[]).map(
    ({ units, ...attempt }): AttemptWithUnit => ({
      ...attempt,
      percent: Number(attempt.percent),
      unit_name: units?.name ?? 'Unit',
    }),
  )
}

export type WeakSpot = { question: string; answer: string; subtopicId: string | null }

// Questions the student got wrong in their latest rounds 1-2 attempts for a unit (newest first).
export async function getWeakSpots(unitId: string, limit = 5): Promise<WeakSpot[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('answers')
    .eq('unit_id', unitId)
    .in('round', [1, 2])
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) throw new Error('Could not load your weak spots.')

  const seen = new Set<string>()
  const spots: WeakSpot[] = []
  for (const attempt of (data ?? []) as { answers: AnswerRecord[] | null }[]) {
    for (const a of attempt.answers ?? []) {
      if (a.chosen === a.correct || seen.has(a.question)) continue
      seen.add(a.question)
      spots.push({
        question: a.question,
        answer: a.options[a.correct] ?? '',
        subtopicId: a.subtopic_id ?? null,
      })
    }
  }
  return spots.slice(0, limit)
}

// Watch-then-check: 3 questions picked at random from the unit's rounds 1 and 2.
export async function getQuickCheck(unitId: string): Promise<QuizQuestion[]> {
  const [one, two] = await Promise.all([getRoundQuestions(unitId, 1), getRoundQuestions(unitId, 2)])
  return [...one, ...two]
    .map((q) => ({ q, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3)
    .map(({ q }) => q)
}
