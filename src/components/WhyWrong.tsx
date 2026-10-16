import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { QuizQuestion } from '../lib/quiz'
import { explainMistake } from '../services/aiService'
import { AppError, errorMessage } from '../services/functionsClient'

// "Why was I wrong?": one tap asks Gemini (the student's own key) for a short, personal explanation.
export default function WhyWrong({ question, chosen }: { question: QuizQuestion; chosen: number }) {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'done'; text: string }
    | { kind: 'error'; code: string; text: string }
  >({ kind: 'idle' })

  async function ask() {
    setState({ kind: 'loading' })
    try {
      const text = await explainMistake(
        question.question,
        question.options,
        chosen,
        question.correctIndex,
      )
      setState({ kind: 'done', text })
    } catch (err) {
      setState({
        kind: 'error',
        code: err instanceof AppError ? err.code : 'ERROR',
        text: errorMessage(err),
      })
    }
  }

  if (state.kind === 'idle') {
    return (
      <button type="button" className="btn-ghost mt-3 text-xs!" onClick={() => void ask()}>
        Why was I wrong?
      </button>
    )
  }
  if (state.kind === 'loading') return <p className="mt-3 text-sm text-muted">Thinking…</p>
  if (state.kind === 'error') {
    return (
      <p role="alert" className="mt-3 text-sm text-danger">
        {state.text}{' '}
        {state.code === 'NO_KEY' && (
          <Link to="/settings" className="font-medium underline">
            Open Settings
          </Link>
        )}
      </p>
    )
  }
  return (
    <p className="mt-3 border-l-4 border-green pl-3 text-sm leading-relaxed whitespace-pre-line">
      {state.text}
    </p>
  )
}
