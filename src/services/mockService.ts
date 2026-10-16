import { supabase } from '../lib/supabaseClient'
import type { ExamRules, MockResult } from '../lib/examRules'
import { getSyllabus } from './examService'

export type MockQuestion = { section: number; question: string; options: string[]; correct: number }

// Picks random questions from the exam's own units, section by section, as the rules say.
export async function buildMock(examId: string, rules: ExamRules): Promise<MockQuestion[]> {
  const subjects = await getSyllabus(examId)
  const unitIds = subjects.flatMap((s) => s.units.map((u) => u.id))
  const { data, error } = await supabase
    .from('questions')
    .select('unit_id, question, options, correct_index')
    .in('unit_id', unitIds)
  if (error) throw new Error('Could not load questions for the mock test.')

  const rows = data as {
    unit_id: string
    question: string
    options: string[]
    correct_index: number
  }[]
  const shuffle = <T>(list: T[]) =>
    list
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item)

  return rules.sections.flatMap((section, index) => {
    const subject = subjects.find((s) => s.name === section.subject)
    const units = new Set(subject?.units.map((u) => u.id) ?? [])
    return shuffle(rows.filter((r) => units.has(r.unit_id)))
      .slice(0, section.count)
      .map((r) => ({
        section: index,
        question: r.question,
        options: r.options,
        correct: r.correct_index,
      }))
  })
}

export type MockAttempt = {
  id: string
  score: number
  max_score: number
  correct: number
  wrong: number
  skipped: number
  seconds: number
  created_at: string
}

// Saves a finished mock. Returns false if it could not be saved (e.g. before the update).
export async function saveMock(
  examId: string,
  result: MockResult,
  seconds: number,
): Promise<boolean> {
  const { error } = await supabase.from('mock_attempts').insert({
    exam_id: examId,
    score: result.score,
    max_score: result.maxScore,
    correct: result.correct,
    wrong: result.wrong,
    skipped: result.skipped,
    seconds,
  })
  return !error
}

export async function listMocks(examId: string): Promise<MockAttempt[]> {
  const { data, error } = await supabase
    .from('mock_attempts')
    .select('id, score, max_score, correct, wrong, skipped, seconds, created_at')
    .eq('exam_id', examId)
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) return [] // before the study-tools update: no history yet
  return (data as MockAttempt[]).map((m) => ({
    ...m,
    score: Number(m.score),
    max_score: Number(m.max_score),
  }))
}
