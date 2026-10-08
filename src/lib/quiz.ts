import type { AnswerRecord } from '../types/database'

// A unit counts as complete at 60% or more on any finished round.
export const PASS_PERCENT = 60

// One question in the shape the quiz screen uses (predefined and AI questions both fit).
export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export type QuizResult = { score: number; total: number; percent: number; passed: boolean }

export function scoreQuiz(questions: QuizQuestion[], chosen: number[]): QuizResult {
  const total = questions.length
  const score = questions.filter((q, i) => chosen[i] === q.correctIndex).length
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)
  return { score, total, percent, passed: percent >= PASS_PERCENT }
}

export function toAnswerRecords(questions: QuizQuestion[], chosen: number[]): AnswerRecord[] {
  return questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    chosen: chosen[i],
    correct: q.correctIndex,
  }))
}
