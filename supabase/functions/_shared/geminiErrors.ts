// Turns a failed Gemini call into one of our error codes plus a message the student can act on.
// Google's error reply looks like:
//   { error: { code: 400, message: 'API key not valid...', status: 'INVALID_ARGUMENT',
//              details: [{ reason: 'API_KEY_INVALID' }] } }
// No imports on purpose, so Vitest can test it too.

export type GeminiErrorInput = {
  status: number // HTTP status
  googleStatus?: string
  reason?: string
  message: string // Google's message (it never contains the key)
}

export type AppFailure = { code: string; message: string; httpStatus: number }

export function classifyGeminiError(err: GeminiErrorInput): AppFailure {
  const said = googleSaid(err.message)

  if (err.reason === 'API_KEY_INVALID' || /api key (not valid|expired)/i.test(err.message)) {
    return {
      code: 'BAD_KEY',
      message: `Google says this key is not valid or has expired. Create a new key in AI Studio and save it in Settings.${said}`,
      httpStatus: 400,
    }
  }
  if (err.googleStatus === 'FAILED_PRECONDITION' && /location|region|country/i.test(err.message)) {
    return {
      code: 'REGION',
      message: `Google does not offer Gemini in the region this request came from.${said}`,
      httpStatus: 400,
    }
  }
  if (err.googleStatus === 'PERMISSION_DENIED' || err.status === 403) {
    return {
      code: 'NO_ACCESS',
      message: `This key is not allowed to use Gemini. In AI Studio, check the key and its project.${said}`,
      httpStatus: 400,
    }
  }
  if (err.googleStatus === 'NOT_FOUND' || err.status === 404) {
    return {
      code: 'MODEL_UNAVAILABLE',
      message: `The AI model this app uses is not available right now. Your key is probably fine.${said}`,
      httpStatus: 502,
    }
  }
  if (err.googleStatus === 'RESOURCE_EXHAUSTED' || err.status === 429) {
    return {
      code: 'RATE_LIMIT',
      message: 'The AI is busy or your key hit its limit. Try again in a minute.',
      httpStatus: 429,
    }
  }
  if (err.googleStatus === 'UNAVAILABLE' || err.status === 503 || err.status === 500) {
    return {
      code: 'BUSY',
      message: "Google's AI is very busy right now. Wait a few seconds and try again.",
      httpStatus: 503,
    }
  }
  // Anything else (including a plain 400) is our request or Google's side, not the key.
  return {
    code: 'AI_FAILED',
    message: `The AI could not answer right now. Please try again.${said}`,
    httpStatus: 502,
  }
}

// Adds Google's own words (short) so the real reason is visible on screen.
function googleSaid(message: string): string {
  const text = message.trim()
  if (!text || /^Gemini returned \d+$/.test(text)) return ''
  return ` (Google said: "${text.length > 160 ? `${text.slice(0, 157)}...` : text}")`
}
