import { describe, expect, it } from 'vitest'
import { pickDailyChallenges } from './challenges'
import { addDays, lastDays, localDay } from './dates'
import { greeting } from './greeting'
import { PASS_PERCENT, scoreQuiz, toAnswerRecords, type QuizQuestion } from './quiz'
import { liveStreak } from './streak'

describe('dates', () => {
  it('formats the local day as YYYY-MM-DD', () => {
    expect(localDay(new Date(2026, 9, 8, 23, 30))).toBe('2026-10-08')
  })

  it('adds days across month ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('lists the last N days ending today', () => {
    expect(lastDays(3, '2026-10-08')).toEqual(['2026-10-06', '2026-10-07', '2026-10-08'])
  })
})

describe('liveStreak', () => {
  const today = '2026-10-08'

  it('keeps the streak if the last full day was today or yesterday', () => {
    expect(liveStreak(5, today, today)).toBe(5)
    expect(liveStreak(5, '2026-10-07', today)).toBe(5)
  })

  it('shows 0 once a day was missed', () => {
    expect(liveStreak(5, '2026-10-06', today)).toBe(0)
    expect(liveStreak(0, null, today)).toBe(0)
  })
})

describe('pickDailyChallenges', () => {
  const list = [1, 2, 3, 4, 5].map((id) => ({ id, text: `Task ${id}` }))

  it('picks two different tasks', () => {
    const picks = pickDailyChallenges(list, '2026-10-08')
    expect(picks).toHaveLength(2)
    expect(picks[0].id).not.toBe(picks[1].id)
  })

  it('gives the same tasks for the same day, whatever the list order', () => {
    const a = pickDailyChallenges(list, '2026-10-08')
    const b = pickDailyChallenges([...list].reverse(), '2026-10-08')
    expect(a).toEqual(b)
  })

  it('changes tasks on the next day', () => {
    const a = pickDailyChallenges(list, '2026-10-08')
    const b = pickDailyChallenges(list, '2026-10-09')
    expect(a).not.toEqual(b)
  })
})

describe('scoreQuiz', () => {
  const questions: QuizQuestion[] = Array.from({ length: 5 }, (_, i) => ({
    question: `Q${i}`,
    options: ['a', 'b', 'c', 'd'],
    correctIndex: i % 4,
  }))

  it('counts correct answers and the percent', () => {
    const result = scoreQuiz(questions, [0, 1, 2, 0, 0])
    expect(result).toEqual({ score: 4, total: 5, percent: 80, passed: true })
  })

  it(`passes at exactly ${PASS_PERCENT}%`, () => {
    expect(scoreQuiz(questions, [0, 1, 2, 1, 1]).passed).toBe(true) // 3/5 = 60%
    expect(scoreQuiz(questions, [0, 1, 0, 1, 1]).passed).toBe(false) // 2/5 = 40%
  })

  it('stores what was chosen next to the right answer', () => {
    const records = toAnswerRecords(questions.slice(0, 1), [3])
    expect(records[0]).toMatchObject({ question: 'Q0', chosen: 3, correct: 0 })
  })
})

describe('greeting', () => {
  it('depends on the hour', () => {
    expect(greeting(new Date(2026, 0, 1, 9))).toBe('Good morning')
    expect(greeting(new Date(2026, 0, 1, 14))).toBe('Good afternoon')
    expect(greeting(new Date(2026, 0, 1, 20))).toBe('Good evening')
  })
})
