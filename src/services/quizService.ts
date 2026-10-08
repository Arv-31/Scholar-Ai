import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { scoreQuiz, toAnswerRecords, type QuizQuestion } from '../lib/quiz'
import type { QuizAttempt, Round } from '../types/database'
import { callFunction } from './functionsClient'

// Rounds 1 and 2: the 5 saved questions for this unit.
export async function getRoundQuestions(unitId: string, round: 1 | 2): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('question, options, correct_index')
    .eq('unit_id', unitId)
    .eq('round', round)
    .order('sort_order')
  if (error) throw new Error('Could not load the questions.')

  return (data as { question: string; options: string[]; correct_index: number }[]).map((q) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correct_index,
  }))
}

const Round3Response = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().optional(),
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
