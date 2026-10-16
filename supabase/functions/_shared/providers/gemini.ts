import { GeminiError, ProviderError, type ModelRequest } from './types.ts'

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Google sometimes answers "high demand" (503) or a passing server error (500).
// Those usually clear in seconds, so we wait a little and try again before giving up.
const RETRY_WAITS_MS = [1000, 2500]

export function isGeminiBusy(error: unknown): boolean {
  return error instanceof GeminiError && (error.status === 503 || error.status === 500)
}

export async function callGemini(req: ModelRequest): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callGeminiOnce(req)
    } catch (error) {
      if (!isGeminiBusy(error) || attempt >= RETRY_WAITS_MS.length) throw error
      await new Promise((resolve) => setTimeout(resolve, RETRY_WAITS_MS[attempt]))
    }
  }
}

async function callGeminiOnce(req: ModelRequest): Promise<string> {
  const res = await fetch(`${BASE}/${req.model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': req.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: req.json ? { responseMimeType: 'application/json' } : undefined,
    }),
  })

  if (!res.ok) throw await readGeminiError(res)

  const data = await res.json()
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? []
  const text = parts.map((p) => p.text ?? '').join('')
  if (!text) throw new ProviderError('Gemini returned an empty answer', 502)
  return text
}

// Check used before saving a key: a tiny real request to the model we actually use.
// This catches a bad key, no access to the model, region and quota problems all at once.
// Returns null when the key works.
export async function checkGeminiKey(apiKey: string, model: string): Promise<GeminiError | null> {
  const res = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with OK' }] }],
      generationConfig: { maxOutputTokens: 8 },
    }),
  })
  if (res.ok) return null
  return await readGeminiError(res)
}

type GoogleError = { message?: string; status?: string; details?: { reason?: string }[] }

// Reads Google's real reason from the error reply instead of throwing it away.
async function readGeminiError(res: Response): Promise<GeminiError> {
  const body = await res.json().catch(() => null)
  const g: GoogleError | undefined = body?.error
  const reason = g?.details?.find((d) => d.reason)?.reason
  // Safe to log: Google's error reply never contains the key.
  console.error('gemini error:', res.status, g?.status ?? '-', reason ?? '-', g?.message ?? '')
  return new GeminiError(g?.message ?? `Gemini returned ${res.status}`, res.status, g?.status, reason)
}
