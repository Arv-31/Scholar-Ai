import { supabase } from '../lib/supabaseClient'
import type { Exam, Subject, Unit, UnitProgress } from '../types/database'

export type SubjectWithUnits = Subject & { units: Unit[] }

export type UnitDetail = Unit & {
  subject: { id: string; name: string }
  exam: { id: string; code: string; name: string }
}

export async function listExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('id, code, name, sort_order')
    .order('sort_order')
  if (error) throw new Error('Could not load exams.')
  return data as Exam[]
}

export async function getExam(examId: string): Promise<Exam | null> {
  const { data } = await supabase
    .from('exams')
    .select('id, code, name, sort_order')
    .eq('id', examId)
    .maybeSingle()
  return data as Exam | null
}

// All subjects of one exam, each with its units, in syllabus order.
export async function getSyllabus(examId: string): Promise<SubjectWithUnits[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, exam_id, name, sort_order, units(id, subject_id, name, sort_order)')
    .eq('exam_id', examId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'units' })
  if (error) throw new Error('Could not load subjects.')
  return data as SubjectWithUnits[]
}

export async function getUnit(unitId: string): Promise<UnitDetail | null> {
  const { data, error } = await supabase
    .from('units')
    .select('id, subject_id, name, sort_order, subjects(id, name, exams(id, code, name))')
    .eq('id', unitId)
    .maybeSingle()
  if (error || !data) return null

  const { subjects, ...unit } = data as unknown as Unit & {
    subjects: { id: string; name: string; exams: UnitDetail['exam'] }
  }
  return {
    ...unit,
    subject: { id: subjects.id, name: subjects.name },
    exam: subjects.exams,
  }
}

// The student's progress for every unit they have tried, keyed by unit id.
export async function getMyUnitProgress(): Promise<Record<string, UnitProgress>> {
  const { data, error } = await supabase
    .from('unit_progress')
    .select('unit_id, completed, best_percent, last_score, last_total, last_percent, last_attempt_at')
  if (error) throw new Error('Could not load your progress.')

  const byUnit: Record<string, UnitProgress> = {}
  for (const row of data as UnitProgress[]) {
    byUnit[row.unit_id] = {
      ...row,
      best_percent: Number(row.best_percent),
      last_percent: Number(row.last_percent),
    }
  }
  return byUnit
}
