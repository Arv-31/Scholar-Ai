import type { ExamNotes, SubtopicNotes, SyllabusMap } from '../content/types'

// Written study content: syllabus maps and subtopic notes.
// Each exam's file loads only when it is first needed, so the app itself stays small.

const maps: Record<string, () => Promise<{ default: SyllabusMap }>> = {
  NIMCET: () => import('../content/syllabus/nimcet'),
  'PGCET-MCA': () => import('../content/syllabus/pgcet'),
  MBA: () => import('../content/syllabus/mba'),
}

const notes: Record<string, () => Promise<{ default: ExamNotes }>> = {
  NIMCET: () => import('../content/notes/nimcet'),
  'PGCET-MCA': () => import('../content/notes/pgcet'),
  MBA: () => import('../content/notes/mba'),
}

export const notesKey = (unit: string, subtopic: string) => `${unit}|${subtopic}`

export async function getSyllabusMap(examCode: string): Promise<SyllabusMap | null> {
  const load = maps[examCode]
  return load ? (await load()).default : null
}

export async function getNotes(
  examCode: string,
  unit: string,
  subtopic: string,
): Promise<SubtopicNotes | null> {
  const load = notes[examCode]
  if (!load) return null
  return (await load()).default[notesKey(unit, subtopic)] ?? null
}
