import { ProviderError, type ModelRequest } from './types.ts'

// Ready for later. Used only when aiRouting.ts sends a task to 'claude'.
export async function callClaude(req: ModelRequest): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: 2048,
      system: req.json ? `${req.system}\nReply with JSON only.` : req.system,
      messages: req.messages,
    }),
  })

  if (!res.ok) throw new ProviderError(`Claude returned ${res.status}`, res.status)

  const data = await res.json()
  const blocks: { type: string; text?: string }[] = data?.content ?? []
  const text = blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
  if (!text) throw new ProviderError('Claude returned an empty answer', 502)
  return text
}
