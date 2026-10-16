// TypeScript shapes of our database rows (see supabase/migrations).

export type Mode = 'default' | 'exam'

export type Profile = {
  id: string
  display_name: string | null
  mode: Mode
  exam_id: string | null
  current_streak: number
  best_streak: number
  last_streak_date: string | null
  gemini_key_hint: string | null
}

export type Exam = { id: string; code: string; name: string; sort_order: number }
export type Subject = { id: string; exam_id: string; name: string; sort_order: number }
export type Unit = { id: string; subject_id: string; name: string; sort_order: number }
export type Subtopic = { id: string; unit_id: string; name: string; sort_order: number }

// A quiz round of a subtopic: 1 to 10 (see ROUNDS in lib/quiz.ts)
export type Round = number

export type Question = {
  id: string
  unit_id: string
  subtopic_id: string | null
  round: Round
  question: string
  options: string[]
  correct_index: number
}

// One answered question, saved inside quiz_attempts.answers
export type AnswerRecord = {
  question: string
  options: string[]
  chosen: number
  correct: number
  subtopic_id?: string | null // saved from 16 Oct 2026; older answers are matched by question text
}

export type QuizAttempt = {
  id: string
  unit_id: string
  subtopic_id?: string | null // empty for attempts made before subtopic rounds
  round: Round
  score: number
  total: number
  percent: number
  created_at: string
}

export type UnitProgress = {
  unit_id: string
  completed: boolean
  best_percent: number
  last_score: number
  last_total: number
  last_percent: number
  last_attempt_at: string
}

export type UnitVideo = {
  id: string
  unit_id: string
  youtube_video_id: string
  title: string
  channel_title: string | null
  thumbnail_url: string | null
}

export type Challenge = { id: number; text: string }

export type BookKind = 'fiction' | 'non_fiction'

export type DailyBook = {
  kind: BookKind
  title: string
  author: string
  reason: string
}
