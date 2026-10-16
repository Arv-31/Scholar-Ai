import { describe, expect, it } from 'vitest'
import { daysUntil, unitsPerDay } from './countdown'

describe('exam countdown', () => {
  it('counts whole days, across months', () => {
    expect(daysUntil('2026-10-16', '2026-10-17')).toBe(1)
    expect(daysUntil('2026-10-16', '2026-11-15')).toBe(30)
    expect(daysUntil('2026-10-16', '2026-10-16')).toBe(0)
    expect(daysUntil('2026-10-16', '2026-10-10')).toBe(-6)
  })

  it('suggests a daily unit target', () => {
    expect(unitsPerDay(37, 30)).toBe(2)
    expect(unitsPerDay(10, 30)).toBe(1)
    expect(unitsPerDay(5, 0)).toBe(5)
    expect(unitsPerDay(0, 10)).toBe(0)
  })
})
