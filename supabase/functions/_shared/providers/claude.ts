import Anthropic from 'npm:@anthropic-ai/sdk@0.131.0'
import { ProviderError, type ModelRequest } from './types.ts'

// Used when aiRouting.ts sends a task to 'claude'. The key is the project's ANTHROPIC_API_KEY secret.
export async function callClaude(req: ModelRequest): Promise<string> {
  // The SDK already retries busy/overloaded answers (twice) on its own.
  const client = new Anthropic({ apiKey: req.apiKey })

  try {
    const response = await client.beta.messages.create({
      model: req.model,
      max_tokens: 4000,
      system: req.json ? `${req.system}\nReply with JSON only.` : req.system,
      messages: req.messages,
      output_config: { effort: 'low' }, // short tutor answers: fast and cheap
      // If Claude declines a message for safety reasons, Anthropic retries it on a suitable model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    })

    if (response.stop_reason === 'refusal') {
      throw new ProviderError('Claude declined to answer', 422)
    }
    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
    if (!text) throw new ProviderError('Claude returned an empty answer', 502)
    return text
  } catch (error) {
    if (error instanceof ProviderError) throw error
    if (error instanceof Anthropic.APIError) {
      // Safe to log: Anthropic's error never contains the key.
      console.error('claude error:', error.status, error.message)
      throw new ProviderError(`Claude returned ${error.status}`, error.status ?? 502)
    }
    throw error
  }
}
