import { describe, expect, it } from 'vitest'
import { EXAM_RULES, scoreMock } from './examRules'

describe('scoreMock', () => {
  it('applies NIMCET negative marking per section', () => {
    const r = scoreMock(EXAM_RULES.NIMCET, [
      { section: 0, chosen: 1, correct: 1 }, // maths right +12
      { section: 0, chosen: 2, correct: 1 }, // maths wrong -3
      { section: 3, chosen: 0, correct: 3 }, // english wrong -1
      { section: 1, chosen: null, correct: 0 }, // skipped 0
    ])
    expect(r.score).toBe(8)
    expect(r.maxScore).toBe(12 + 12 + 4 + 6)
    expect(r).toMatchObject({ correct: 1, wrong: 2, skipped: 1, lostToGuessing: 4 })
  })

  it('never takes marks away in PGCET', () => {
    const r = scoreMock(EXAM_RULES['PGCET-MCA'], [
      { section: 0, chosen: 1, correct: 0 },
      { section: 1, chosen: 2, correct: 2 },
    ])
    expect(r.score).toBe(1)
    expect(r.lostToGuessing).toBe(0)
  })

  it('has question counts that add up for every exam', () => {
    for (const rules of Object.values(EXAM_RULES)) {
      expect(rules.sections.reduce((n, s) => n + s.count, 0)).toBeGreaterThan(20)
      expect(rules.minutes).toBeGreaterThan(0)
    }
  })
})
