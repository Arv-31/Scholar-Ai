// THE one place that decides which AI answers which task.
// Everything runs on Gemini (the student's own key). The chatbot moves to Claude by itself only
// if an ANTHROPIC_API_KEY secret is ever added.
// No page or service changes are needed to move a task to another provider.

export type Provider = 'gemini' | 'claude'
export type AiTask = 'chat' | 'quiz' | 'books' | 'explain'

// Gemini model name. Change it without a code release:
//   supabase secrets set GEMINI_MODEL=<model name>
export const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.8-flash'

// Backup Gemini models, tried in order when the main one stays busy. Empty unless set:
//   supabase secrets set GEMINI_FALLBACK_MODELS=<model a>,<model b>
export const GEMINI_FALLBACK_MODELS = (Deno.env.get('GEMINI_FALLBACK_MODELS') ?? '')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean)

export type Route = { provider: Provider; model: string; fallbacks?: string[] }

// Claude model for the chatbot. Change it without a code release:
//   supabase secrets set CLAUDE_MODEL=<model name>
export const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-opus-5-5'

// The chatbot uses Claude as soon as the ANTHROPIC_API_KEY secret exists; until then it stays on Gemini.
const chatRoute: Route = Deno.env.get('ANTHROPIC_API_KEY')
  ? { provider: 'claude', model: CLAUDE_MODEL }
  : { provider: 'gemini', model: GEMINI_MODEL, fallbacks: GEMINI_FALLBACK_MODELS }

export const AI_ROUTES: Record<AiTask, Route> = {
  chat: chatRoute,
  quiz: { provider: 'gemini', model: GEMINI_MODEL, fallbacks: GEMINI_FALLBACK_MODELS },
  books: { provider: 'gemini', model: GEMINI_MODEL, fallbacks: GEMINI_FALLBACK_MODELS },
  explain: { provider: 'gemini', model: GEMINI_MODEL, fallbacks: GEMINI_FALLBACK_MODELS },
}
