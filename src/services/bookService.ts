import type { PastBook } from '../lib/bookHistory'
import { supabase } from '../lib/supabaseClient'

// Past daily book picks. They are already saved in daily_books (one row per day per kind),
// so the history is just a read of your own rows; RLS keeps other students' rows out.

export const BOOKS_PAGE = 20 // 10 days of 2 picks

export async function listPastBooks(
  offset: number,
): Promise<{ books: PastBook[]; hasMore: boolean }> {
  const { data, error } = await supabase
    .from('daily_books')
    .select('day, kind, title, author')
    .order('day', { ascending: false })
    .order('kind', { ascending: true })
    .range(offset, offset + BOOKS_PAGE) // one extra row tells us if there is more
  if (error) throw new Error('Could not load your book picks.')
  const rows = data as PastBook[]
  return { books: rows.slice(0, BOOKS_PAGE), hasMore: rows.length > BOOKS_PAGE }
}
