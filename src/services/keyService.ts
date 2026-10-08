import { z } from 'zod'
import { callFunction } from './functionsClient'

// The student's own Gemini key. The browser sends it once to the server and never reads it back;
// we only ever get the masked hint (e.g. "AIza…x9Qk").

const KeyResponse = z.object({ hint: z.string().nullable() })

export const GeminiKeySchema = z
  .string()
  .trim()
  .regex(/^AIza[0-9A-Za-z_-]{30,}$/, 'Gemini keys start with "AIza". Copy the full key from AI Studio.')

export async function saveGeminiKey(key: string): Promise<string | null> {
  const result = await callFunction('gemini-key', { action: 'save', key: key.trim() }, KeyResponse)
  return result.hint
}

export async function removeGeminiKey(): Promise<void> {
  await callFunction('gemini-key', { action: 'remove' }, KeyResponse)
}
