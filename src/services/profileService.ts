import { supabase } from '../lib/supabaseClient'
import type { Mode, Profile } from '../types/database'

const PROFILE_COLUMNS =
  'id, display_name, mode, exam_id, current_streak, best_streak, last_streak_date, gemini_key_hint'

export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

// Returns the logged-in student's profile, or null if it can't be loaded.
export async function getMyProfile(): Promise<Profile | null> {
  const userId = await currentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) return null
  return data as Profile | null
}

// Remembers which mode (Default / Exam) the student used last.
export async function updateMyMode(mode: Mode): Promise<void> {
  await updateMyProfile({ mode })
}

export async function updateMyExam(examId: string): Promise<void> {
  await updateMyProfile({ exam_id: examId })
}

export async function updateMyName(name: string): Promise<void> {
  await updateMyProfile({ display_name: name.trim() || null })
}

async function updateMyProfile(
  changes: Partial<Pick<Profile, 'mode' | 'exam_id' | 'display_name'>>,
): Promise<void> {
  const userId = await currentUserId()
  if (!userId) return
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId)
  if (error) throw new Error('Could not save your changes.')
}

// Study settings: exam date (for the countdown) and the AI answer language.
// Loaded on their own so the normal profile still works before these columns exist.
export type StudyPrefs = { exam_date: string | null; language: 'en' | 'kn'; available: boolean }

export async function getStudyPrefs(): Promise<StudyPrefs> {
  const userId = await currentUserId()
  const fallback: StudyPrefs = { exam_date: null, language: 'en', available: false }
  if (!userId) return fallback
  const { data, error } = await supabase
    .from('profiles')
    .select('exam_date, language')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return fallback
  const row = data as { exam_date: string | null; language: string }
  return {
    exam_date: row.exam_date,
    language: row.language === 'kn' ? 'kn' : 'en',
    available: true,
  }
}

export async function updateStudyPrefs(
  changes: Partial<Pick<StudyPrefs, 'exam_date' | 'language'>>,
): Promise<void> {
  const userId = await currentUserId()
  if (!userId) return
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId)
  if (error) throw new Error('Could not save your study settings.')
}
