import { AI_ROUTES, type AiTask } from './aiRouting.ts'
import { getGeminiKey } from './auth.ts'
import { callClaude } from './providers/claude.ts'
import { callGemini } from './providers/gemini.ts'
import type { ChatMessage } from './providers/types.ts'
import { retrieve } from './retrieve.ts'

export class NoKeyError extends Error {}

type CallInput = {
  task: AiTask
  userId: string
  system: string
  messages: ChatMessage[]
  json?: boolean
}

// Every AI call goes through here: route -> retrieve() -> provider.
export async function callAi(input: CallInput): Promise<string> {
  const route = AI_ROUTES[input.task]

  // 1. Retrieve (no-op today, RAG later)
  const lastUserMessage = [...input.messages].reverse().find((m) => m.role === 'user')
  const passages = await retrieve(input.task, lastUserMessage?.content ?? '')
  const system = passages.length
    ? `${input.system}\n\nUseful notes:\n${passages.map((p) => `- ${p}`).join('\n')}`
    : input.system

  // 2. Pick the key for the provider
  const apiKey =
    route.provider === 'gemini'
      ? await getGeminiKey(input.userId) // student's own key (BYOK)
      : Deno.env.get('ANTHROPIC_API_KEY') // project secret
  if (!apiKey) throw new NoKeyError()

  // 3. Call the provider
  const request = { model: route.model, apiKey, system, messages: input.messages, json: input.json }
  return route.provider === 'gemini' ? callGemini(request) : callClaude(request)
}

// Models sometimes wrap JSON in ``` fences. This strips them before parsing.
export function parseJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()
  return JSON.parse(cleaned)
}
