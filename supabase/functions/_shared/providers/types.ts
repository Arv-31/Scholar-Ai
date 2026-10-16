// The shape every provider accepts, so they are interchangeable.
export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type ModelRequest = {
  model: string
  apiKey: string
  system: string
  messages: ChatMessage[]
  json?: boolean // ask for a JSON-only answer
}

export class ProviderError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// A Gemini error that keeps Google's own reason, so we can tell a bad key from other problems.
export class GeminiError extends ProviderError {
  googleStatus?: string // Google's error.status, e.g. 'PERMISSION_DENIED'
  reason?: string // Google's error.details[].reason, e.g. 'API_KEY_INVALID'

  constructor(message: string, status: number, googleStatus?: string, reason?: string) {
    super(message, status)
    this.googleStatus = googleStatus
    this.reason = reason
  }
}
