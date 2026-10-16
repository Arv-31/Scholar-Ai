import { describe, expect, it } from 'vitest'
import { buildMastery, masteryPercent } from './mastery'

describe('masteryPercent', () => {
  it('is 0 before anything is done', () => {
    expect(masteryPercent({ videoWatch: [0, 0], bestQuizPercent: null })).toBe(0)
  })

  it('is half videos, half best quiz', () => {
    expect(masteryPercent({ videoWatch: [100, 50], bestQuizPercent: 80 })).toBe(78) // 37.5 + 40
  })

  it('uses only the quiz when the unit has no videos', () => {
    expect(masteryPercent({ videoWatch: [], bestQuizPercent: 60 })).toBe(60)
  })

  it('reaches 100 only when everything is done', () => {
    expect(masteryPercent({ videoWatch: [100, 100], bestQuizPercent: 100 })).toBe(100)
  })

  it('clamps bad values', () => {
    expect(masteryPercent({ videoWatch: [150], bestQuizPercent: -5 })).toBe(50)
  })
})

describe('buildMastery', () => {
  const subtopics = [
    { id: 's1', unit_id: 'u1', name: 'Limits', sort_order: 0 },
    { id: 's2', unit_id: 'u1', name: 'Integration', sort_order: 1 },
  ]
  const questions = [
    { unit_id: 'u1', question: 'Q limit', subtopic_id: 's1' },
    { unit_id: 'u1', question: 'Q integral', subtopic_id: 's2' },
  ]

  it('gives each subtopic its own score and averages them for the unit', () => {
    const result = buildMastery({
      subtopics,
      questions,
      // older answers (no subtopic saved) are matched by question text
      attempts: [
        {
          unit_id: 'u1',
          percent: 50,
          answers: [
            { question: 'Q limit', chosen: 1, correct: 1 },
            { question: 'Q integral', chosen: 0, correct: 2 },
          ],
        },
      ],
      videos: [],
      watch: {},
    })
    expect(result.u1.subtopics.map((s) => s.mastery)).toEqual([100, 0])
    expect(result.u1.mastery).toBe(50)
  })

  it('uses the best attempt for each subtopic separately', () => {
    const result = buildMastery({
      subtopics,
      questions,
      attempts: [
        {
          unit_id: 'u1',
          percent: 50,
          answers: [{ question: 'x', chosen: 0, correct: 0, subtopic_id: 's1' }],
        },
        {
          unit_id: 'u1',
          percent: 50,
          answers: [{ question: 'y', chosen: 0, correct: 0, subtopic_id: 's2' }],
        },
      ],
      videos: [],
      watch: {},
    })
    expect(result.u1.mastery).toBe(100)
  })

  it('counts a video for the subtopic named in its title', () => {
    const result = buildMastery({
      subtopics,
      questions,
      attempts: [],
      videos: [
        { id: 'v1', unit_id: 'u1', title: 'Integration tricks for NIMCET', subtopic_id: null },
      ],
      watch: { v1: 100 },
    })
    expect(result.u1.subtopics[1].videoAvg).toBe(100)
    expect(result.u1.subtopics[0].videoAvg).toBeNull()
  })

  it('falls back to the plain unit formula when there are no subtopics', () => {
    const result = buildMastery({
      subtopics: [],
      questions: [],
      attempts: [{ unit_id: 'u2', percent: 80, answers: [] }],
      videos: [{ id: 'v', unit_id: 'u2', title: 't', subtopic_id: null }],
      watch: { v: 40 },
    })
    expect(result.u2.mastery).toBe(60)
    expect(result.u2.subtopics).toEqual([])
  })
})
