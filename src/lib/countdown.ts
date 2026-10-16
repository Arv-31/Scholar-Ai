// Exam countdown maths (dates are 'YYYY-MM-DD' strings in the student's own time zone).

export function daysUntil(today: string, examDate: string): number {
  const ms = Date.parse(`${examDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

// How many units a day are needed to finish the rest before the exam (at least 1).
export function unitsPerDay(unitsLeft: number, daysLeft: number): number {
  if (unitsLeft <= 0) return 0
  return Math.max(1, Math.ceil(unitsLeft / Math.max(daysLeft, 1)))
}
