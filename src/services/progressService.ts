import { addDays } from '../lib/dates'
import { getCompletionCounts } from './challengeService'
import { getExam, getMyUnitProgress, getSyllabus, type SubjectWithUnits } from './examService'
import { listMyAttempts, type AttemptWithUnit } from './quizService'
import { getMyWatch } from './videoService'
import type { Exam, UnitProgress } from '../types/database'

export type ProgressOverview = {
  exam: Exam | null
  subjects: SubjectWithUnits[]
  unitProgress: Record<string, UnitProgress>
  attempts: AttemptWithUnit[]
  videosWatched: number // videos watched 80% or more
  completionCounts: Record<string, number> // tasks done per day, last 28 days
}

export const WATCHED_PERCENT = 80

// Everything the Progress page shows, loaded in parallel.
export async function getProgressOverview(examId: string | null, today: string): Promise<ProgressOverview> {
  const [exam, subjects, unitProgress, attempts, watch, completionCounts] = await Promise.all([
    examId ? getExam(examId) : Promise.resolve(null),
    examId ? getSyllabus(examId) : Promise.resolve([]),
    getMyUnitProgress(),
    listMyAttempts({ limit: 8 }),
    getMyWatch(),
    getCompletionCounts(addDays(today, -27)),
  ])

  return {
    exam,
    subjects,
    unitProgress,
    attempts,
    videosWatched: Object.values(watch).filter((p) => p >= WATCHED_PERCENT).length,
    completionCounts,
  }
}
