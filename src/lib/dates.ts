// Dates as 'YYYY-MM-DD' strings in the student's own time zone.
// (toISOString() would use UTC and can give the wrong day in India late at night.)

export function localDay(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(day: string, amount: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return localDay(new Date(y, m - 1, d + amount))
}

// The last `count` days, oldest first, ending with `today`.
export function lastDays(count: number, today = localDay()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1))
}

// A number that goes up by one each day; used to rotate the daily tasks.
export function dayNumber(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
}

// "8 Oct". Works with a full timestamp or a plain 'YYYY-MM-DD' day.
export function shortDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
    : new Date(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
