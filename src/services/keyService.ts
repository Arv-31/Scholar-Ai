import { z } from 'zod'
import { callFunction } from './functionsClient'

// The student's own Gemini key. The browser sends it once to the server and never reads it back;
// we only ever get the masked hint (e.g. "AIza…x9Qk").

const KeyResponse = z.object({ hint: z.string().nullable() })

// Only a light check here (same length rule as the server). Google itself decides if the key works,
// so a new key format from Google is never blocked by the browser.
export const GeminiKeySchema = z
  .string()
  .trim()
  .regex(
    /^[0-9A-Za-z_.-]{30,100}$/,
    'That does not look like a full key. Copy it again from AI Studio.',
  )

export async function saveGeminiKey(key: string): Promise<string | null> {
  const result = await callFunction('gemini-key', { action: 'save', key: key.trim() }, KeyResponse)
  return result.hint
}

export async function removeGeminiKey(): Promise<void> {
  await callFunction('gemini-key', { action: 'remove' }, KeyResponse)
}
