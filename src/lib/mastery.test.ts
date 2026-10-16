import { describe, expect, it } from 'vitest'
import { masteryPercent } from './mastery'

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
