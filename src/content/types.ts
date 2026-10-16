// Shapes of the written study content (syllabus maps and notes).
// The content lives in code for now; contentService is the only reader, so it can move to the
// database later without changing any screen.

// 3 = must-do (asked almost every year), 2 = regular, 1 = low frequency
export type Importance = 1 | 2 | 3

export type MapSubtopic = { name: string; importance: Importance }
export type MapUnit = {
  name: string
  importance: Importance
  subtopics: MapSubtopic[]
  notInApp?: boolean // in the real syllabus, but no ScholarAI unit yet (drawn dashed)
}

export type MapSection = {
  subject: string // same name as the subject in the database
  weight: number // share of the total marks, in percent
  questions: string // e.g. "50 Qs · +12 / −3"
  inApp: boolean // false = part of the real exam that ScholarAI does not cover yet
  units: MapUnit[]
}

export type Book = { title: string; author: string; use: string }

export type SyllabusMap = {
  examCode: string
  pattern: { label: string; value: string }[]
  weightNote: string // where the numbers come from and how exact they are
  sections: MapSection[]
  books: { subject: string; items: Book[] }[]
  plan: string[] // how to use the map: a short study order
}

export type SubtopicNotes = {
  paragraphs: [string, string, string] // what it is · how it works · exam angle
  keyPoints: string[]
  formulasTitle?: string // "Formulas" by default; e.g. "Rules" for English
  formulas: string[]
}

// Notes of one exam, keyed by "Unit|Subtopic" (names exactly as in the database)
export type ExamNotes = Record<string, SubtopicNotes>
