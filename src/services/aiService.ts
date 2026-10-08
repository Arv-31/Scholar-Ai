import { z } from 'zod'
import type { DailyBook } from '../types/database'
import { callFunction } from './functionsClient'

// Screens use these. Which AI actually answers is decided on the server
// (supabase/functions/_shared/aiRouting.ts), so nothing here changes when we switch providers.

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const ChatResponse = z.object({ reply: z.string() })

export async function askTutor(messages: ChatMessage[], context?: string): Promise<string> {
  const result = await callFunction('ai', { task: 'chat', messages, context }, ChatResponse)
  return result.reply
}

const BooksResponse = z.object({
  books: z.array(
    z.object({
      kind: z.enum(['fiction', 'non_fiction']),
      title: z.string(),
      author: z.string(),
      reason: z.string(),
    }),
  ),
})

// Today's fiction + non-fiction picks. Made once per day, then served from the cache.
export async function getTodaysBooks(day: string): Promise<DailyBook[]> {
  const result = await callFunction('ai', { task: 'books', day }, BooksResponse)
  return result.books
}
