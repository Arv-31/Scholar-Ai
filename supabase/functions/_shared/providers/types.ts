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
