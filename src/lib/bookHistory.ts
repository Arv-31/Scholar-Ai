import type { BookKind } from '../types/database'
import { addDays, localDay, shortDate } from './dates'

// Grouping for the "Book picks" history in Settings.

export type PastBook = { day: string; kind: BookKind; title: string; author: string }
export type BookFilter = 'all' | BookKind
export type BookDay = { day: string; label: string; books: PastBook[] }

// "Today", "Yesterday" or "12 Oct".
export function dayLabel(day: string, today = localDay()): string {
  if (day === today) return 'Today'
  if (day === addDays(today, -1)) return 'Yesterday'
  return shortDate(day)
}

// Newest day first; fiction before non-fiction inside a day. Days left empty by the filter are dropped.
export function groupBooksByDay(
  books: PastBook[],
  filter: BookFilter,
  today = localDay(),
): BookDay[] {
  const byDay = new Map<string, PastBook[]>()
  for (const book of books) {
    if (filter !== 'all' && book.kind !== filter) continue
    byDay.set(book.day, [...(byDay.get(book.day) ?? []), book])
  }
  return [...byDay.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((day) => ({
      day,
      label: dayLabel(day, today),
      books: byDay
        .get(day)!
        .sort((a, b) => Number(a.kind !== 'fiction') - Number(b.kind !== 'fiction')),
    }))
}
