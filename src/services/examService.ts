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
    .select(
      'unit_id, completed, best_percent, last_score, last_total, last_percent, last_attempt_at',
    )
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

// The units of one subject in syllabus order (for "previous / next unit" links).
export async function getSubjectUnits(subjectId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('id, subject_id, name, sort_order')
    .eq('subject_id', subjectId)
    .order('sort_order')
  if (error) throw new Error('Could not load the units.')
  return data as Unit[]
}

export type SubtopicDetail = {
  id: string
  name: string
  unit: { id: string; name: string }
  subject: string
  exam: { id: string; code: string; name: string }
  siblings: { id: string; name: string }[] // all subtopics of the same unit, in order
}

// One subtopic with its unit, subject and exam (for the notes page).
export async function getSubtopic(subtopicId: string): Promise<SubtopicDetail | null> {
  const { data, error } = await supabase
    .from('subtopics')
    .select('id, name, units(id, name, subjects(name, exams(id, code, name)))')
    .eq('id', subtopicId)
    .maybeSingle()
  if (error || !data) return null
  const row = data as unknown as {
    id: string
    name: string
    units: { id: string; name: string; subjects: { name: string; exams: SubtopicDetail['exam'] } }
  }
  const siblings = await supabase
    .from('subtopics')
    .select('id, name')
    .eq('unit_id', row.units.id)
    .order('sort_order')
  return {
    id: row.id,
    name: row.name,
    unit: { id: row.units.id, name: row.units.name },
    subject: row.units.subjects.name,
    exam: row.units.subjects.exams,
    siblings: (siblings.data ?? []) as { id: string; name: string }[],
  }
}

// Every subtopic of one exam, keyed by "Unit|Subtopic" (to link the syllabus map to notes).
export async function getExamSubtopicIds(
  subjects: SubjectWithUnits[],
): Promise<Record<string, string>> {
  const units = subjects.flatMap((s) => s.units)
  if (units.length === 0) return {}
  const { data, error } = await supabase
    .from('subtopics')
    .select('id, name, unit_id')
    .in(
      'unit_id',
      units.map((u) => u.id),
    )
  if (error) return {}
  const unitName = new Map(units.map((u) => [u.id, u.name]))
  return Object.fromEntries(
    (data as { id: string; name: string; unit_id: string }[]).map((s) => [
      `${unitName.get(s.unit_id)}|${s.name}`,
      s.id,
    ]),
  )
}
