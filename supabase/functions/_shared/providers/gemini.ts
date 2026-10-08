import { ProviderError, type ModelRequest } from './types.ts'

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function callGemini(req: ModelRequest): Promise<string> {
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

  if (!res.ok) throw new ProviderError(`Gemini returned ${res.status}`, res.status)

  const data = await res.json()
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? []
  const text = parts.map((p) => p.text ?? '').join('')
  if (!text) throw new ProviderError('Gemini returned an empty answer', 502)
  return text
}

// Quick check that a key works, used before saving it.
export async function isGeminiKeyValid(apiKey: string): Promise<boolean> {
  const res = await fetch(`${BASE}?pageSize=1`, { headers: { 'x-goog-api-key': apiKey } })
  return res.ok
}
