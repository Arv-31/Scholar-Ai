import type { Challenge } from '../types/database'
import { dayNumber } from './dates'

// Picks the same 2 tasks for everyone on a given day, moving through the list day by day.
export function pickDailyChallenges(all: Challenge[], day: string): Challenge[] {
  if (all.length <= 2) return all
  const sorted = [...all].sort((a, b) => a.id - b.id)
  const start = (dayNumber(day) * 2) % sorted.length
  return [sorted[start], sorted[(start + 1) % sorted.length]]
}
