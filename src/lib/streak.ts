import { addDays } from './dates'

// The streak saved in the database only changes when a day is completed.
// If the student skipped yesterday, the saved number is out of date, so we show 0.
export function liveStreak(saved: number, lastDay: string | null, today: string): number {
  if (!lastDay) return 0
  if (lastDay === today || lastDay === addDays(today, -1)) return saved
  return 0
}
