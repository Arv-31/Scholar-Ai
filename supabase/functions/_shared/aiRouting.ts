// THE one place that decides which AI answers which task.
// To move the chatbot to Claude later: change `chat` to { provider: 'claude', model: 'claude-sonnet-5-5' }
// and add the ANTHROPIC_API_KEY Edge Function secret. No page or service changes needed.

export type Provider = 'gemini' | 'claude'
export type AiTask = 'chat' | 'quiz' | 'books'

export type Route = { provider: Provider; model: string }

export const AI_ROUTES: Record<AiTask, Route> = {
  chat: { provider: 'gemini', model: 'gemini-2.5-flash' },
  quiz: { provider: 'gemini', model: 'gemini-2.5-flash' },
  books: { provider: 'gemini', model: 'gemini-2.5-flash' },
}
