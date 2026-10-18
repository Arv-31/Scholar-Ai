import { describe, expect, it } from 'vitest'
import { dayLabel, groupBooksByDay, type PastBook } from './bookHistory'

const books: PastBook[] = [
  { day: '2026-10-16', kind: 'non_fiction', title: 'Deep Work', author: 'Cal Newport' },
  { day: '2026-10-18', kind: 'non_fiction', title: 'Atomic Habits', author: 'James Clear' },
  { day: '2026-10-18', kind: 'fiction', title: 'Piranesi', author: 'Susanna Clarke' },
  { day: '2026-10-16', kind: 'fiction', title: 'Stoner', author: 'John Williams' },
]

describe('book history', () => {
  it('labels today, yesterday and older days', () => {
    expect(dayLabel('2026-10-18', '2026-10-18')).toBe('Today')
    expect(dayLabel('2026-10-17', '2026-10-18')).toBe('Yesterday')
    expect(dayLabel('2026-10-12', '2026-10-18')).toBe('12 Oct')
  })

  it('groups newest day first with fiction first', () => {
    const days = groupBooksByDay(books, 'all', '2026-10-18')
    expect(days.map((d) => d.label)).toEqual(['Today', '16 Oct'])
    expect(days[0].books.map((b) => b.title)).toEqual(['Piranesi', 'Atomic Habits'])
  })

  it('filters by kind', () => {
    const days = groupBooksByDay(books, 'fiction', '2026-10-18')
    expect(days.flatMap((d) => d.books.map((b) => b.title))).toEqual(['Piranesi', 'Stoner'])
  })
})
