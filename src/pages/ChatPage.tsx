import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useLoad } from '../hooks/useLoad'
import { askTutor, type ChatMessage } from '../services/aiService'
import { getUnit } from '../services/examService'
import { AppError, errorMessage } from '../services/functionsClient'

const STARTERS = [
  'Explain this topic in simple words',
  'Give me a quick trick for this',
  'Make 3 practice questions for me',
]

// AI tutor. Messages live only while this page is open (nothing is saved).
export default function ChatPage() {
  const [params] = useSearchParams()
  const unitId = params.get('unit')
  const unit = useLoad(() => (unitId ? getUnit(unitId) : Promise.resolve(null)), unitId ?? '')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const context = unit.data ? `${unit.data.exam.code} · ${unit.data.subject.name} · ${unit.data.name}` : undefined

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  async function send(text: string) {
    const content = text.trim()
    if (!content || sending) return
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setDraft('')
    setSending(true)
    setError(null)
    try {
      const reply = await askTutor(next.slice(-20), context)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setError({ code: err instanceof AppError ? err.code : 'ERROR', message: errorMessage(err) })
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void send(draft)
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-6 lg:min-h-[calc(100vh-5rem)]">
      <PageHeader
        eyebrow="Exam mode · Ask AI"
        title="Your tutor"
        action={
          messages.length > 0 && (
            <button type="button" className="btn-ghost" onClick={() => setMessages([])}>
              New chat
            </button>
          )
        }
      />

      {context && (
        <p className="-mt-3 text-sm text-muted">
          Talking about <span className="font-medium text-ink">{context}</span>
        </p>
      )}

      <section className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5 py-10 text-center">
              <div className="panel grid h-14 w-14 place-items-center rounded-2xl font-display text-xl">
                AI
              </div>
              <div>
                <p className="font-display text-xl">Ask anything from your syllabus</p>
                <p className="mt-1 text-sm text-muted">
                  Doubts, concepts, shortcuts, worked examples. This chat is not saved.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    className="btn-ghost text-xs!"
                    onClick={() => void send(context ? `${starter}: ${context}` : starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user' ? 'bg-ink text-white' : 'border border-line bg-paper'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-muted" role="status">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green [animation-delay:300ms]" />
              <span className="sr-only">Thinking</span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}{' '}
              {error.code === 'NO_KEY' || error.code === 'BAD_KEY' ? (
                <Link to="/settings" className="font-medium underline">
                  Open Settings
                </Link>
              ) : null}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-3">
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <textarea
            id="chat-input"
            className="field max-h-40 min-h-12 resize-none"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(draft)
              }
            }}
            placeholder="Type your doubt…"
            maxLength={4000}
          />
          <button type="submit" className="btn-primary shrink-0 px-5!" disabled={sending || !draft.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  )
}
