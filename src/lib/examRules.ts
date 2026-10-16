// Mock test rules per exam: marks for a right / wrong answer per section, and the time.
// The real exams are longer, so the mock is a shorter version with the SAME marking per question
// and the same time per question. Check the numbers against the latest official notice.
//   NIMCET: Maths +12/−3, Analytical & Computer +6/−1.5, English +4/−1 (120 questions, 120 min)
//   Karnataka PGCET-MCA: +1 per right answer, no negative marking (100 questions, 120 min)
//   MBA entrances: commonly +1/−0.25 (varies by exam)

export type Section = { subject: string; count: number; right: number; wrong: number }
export type ExamRules = { sections: Section[]; minutes: number; note: string }

export const EXAM_RULES: Record<string, ExamRules> = {
  NIMCET: {
    minutes: 28,
    note: 'NIMCET marking: Maths +12 / −3, Reasoning and Computer +6 / −1.5, English +4 / −1.',
    sections: [
      { subject: 'Mathematics', count: 10, right: 12, wrong: 3 },
      { subject: 'Analytical Ability & Logical Reasoning', count: 8, right: 6, wrong: 1.5 },
      { subject: 'Computer Awareness', count: 4, right: 6, wrong: 1.5 },
      { subject: 'General English', count: 6, right: 4, wrong: 1 },
    ],
  },
  'PGCET-MCA': {
    minutes: 30,
    note: 'Karnataka PGCET marking: +1 for a right answer, no negative marking.',
    sections: [
      { subject: 'English Language', count: 6, right: 1, wrong: 0 },
      { subject: 'Quantitative Analysis', count: 7, right: 1, wrong: 0 },
      { subject: 'Analytical & Logical Reasoning', count: 6, right: 1, wrong: 0 },
      { subject: 'Computer Awareness', count: 6, right: 1, wrong: 0 },
    ],
  },
  MBA: {
    minutes: 30,
    note: 'Common MBA marking: +1 for a right answer, −0.25 for a wrong one.',
    sections: [
      { subject: 'Quantitative Aptitude', count: 7, right: 1, wrong: 0.25 },
      { subject: 'Verbal Ability', count: 6, right: 1, wrong: 0.25 },
      { subject: 'Logical Reasoning', count: 6, right: 1, wrong: 0.25 },
      { subject: 'General Knowledge', count: 5, right: 1, wrong: 0.25 },
    ],
  },
}

export type MockAnswer = { section: number; chosen: number | null; correct: number }

export type MockResult = {
  score: number
  maxScore: number
  correct: number
  wrong: number
  skipped: number
  lostToGuessing: number // marks taken away by wrong answers
}

export function scoreMock(rules: ExamRules, answers: MockAnswer[]): MockResult {
  const result = { score: 0, maxScore: 0, correct: 0, wrong: 0, skipped: 0, lostToGuessing: 0 }
  for (const a of answers) {
    const section = rules.sections[a.section]
    result.maxScore += section.right
    if (a.chosen === null) result.skipped += 1
    else if (a.chosen === a.correct) {
      result.correct += 1
      result.score += section.right
    } else {
      result.wrong += 1
      result.score -= section.wrong
      result.lostToGuessing += section.wrong
    }
  }
  return result
}
