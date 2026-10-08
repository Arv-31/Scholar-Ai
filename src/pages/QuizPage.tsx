import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { PASS_PERCENT, scoreQuiz, type QuizQuestion } from '../lib/quiz'
import { getUnit } from '../services/examService'
import { errorMessage } from '../services/functionsClient'
import { getQuestions, saveAttempt } from '../services/quizService'
import type { Round } from '../types/database'

const LETTERS = ['A', 'B', 'C', 'D']

// One quiz round: one question at a time, then the result and a review of every answer.
export default function QuizPage() {
  const { unitId = '', round: roundParam } = useParams()
  const round: Round = roundParam === '2' ? 2 : roundParam === '3' ? 3 : 1
  // Bumping `attempt` reloads the page data, which also gives round 3 fresh questions.
  const [attempt, setAttempt] = useState(0)

  const page = useLoad(
    async () => {
      const [unit, questions] = await Promise.all([getUnit(unitId), getQuestions(unitId, round)])
      return { unit, questions }
    },
    `${unitId}-${round}-${attempt}`,
  )

  const backTo = `/exam/unit/${unitId}`

  if (page.loading) return <Loading label={round === 3 ? 'Writing your questions' : 'Loading'} />

  if (page.errorCode === 'NO_KEY') {
    return (
      <EmptyState
        title="Round 3 needs your Gemini key"
        text="Round 3 questions are made fresh by AI using your own free Gemini key."
        action={
          <Link to="/settings" className="btn-primary py-2! text-sm">
            Add key in Settings
          </Link>
        }
      />
    )
  }
  if (page.error) return <ErrorNote message={page.error} onRetry={page.reload} />
  if (!page.data || page.data.questions.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        text="This round has no questions yet."
        action={<Link to={backTo} className="btn-ghost">Back to unit</Link>}
      />
    )
  }

  return (
    <Quiz
      key={attempt}
      title={`${page.data.unit?.name ?? 'Unit'} · Round ${round}`}
      questions={page.data.questions}
      unitId={unitId}
      round={round}
      backTo={backTo}
      onRetry={() => setAttempt((a) => a + 1)}
    />
  )
}

type QuizProps = {
  title: string
  questions: QuizQuestion[]
  unitId: string
  round: Round
  backTo: string
  onRetry: () => void
}

function Quiz({ title, questions, unitId, round, backTo, onRetry }: QuizProps) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const current = questions[index]
  const picked = chosen[index]
  const isLast = index === questions.length - 1

  function choose(option: number) {
    const next = [...chosen]
    next[index] = option
    setChosen(next)
  }

  async function finish() {
    setFinished(true)
    try {
      await saveAttempt(unitId, round, questions, chosen)
    } catch (error) {
      setSaveError(errorMessage(error))
    }
  }

  if (finished) {
    const result = scoreQuiz(questions, chosen)
    return (
      <div className="space-y-6">
        <Link to={backTo} className="text-sm text-muted transition hover:text-ink">
          ← Back to unit
        </Link>
        <section className="panel p-6 text-center sm:p-10">
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
          <div
            aria-hidden="true"
            className={`absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl ${result.passed ? 'bg-green/40' : 'bg-ember/30'}`}
          />
          <div className="relative">
            <p className="eyebrow text-white/50!">{title}</p>
            <p className="nums mt-3 font-display text-6xl">{result.percent}%</p>
            <p className="nums mt-2 text-white/70">
              {result.score} of {result.total} correct
            </p>
            <p className="mt-4 text-sm text-white/60">
              {result.passed
                ? 'Unit complete. Nice work.'
                : `Score ${PASS_PERCENT}% or more to complete this unit. Look at the answers below and try again.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary py-2! text-sm" onClick={onRetry}>
                {round === 3 ? 'New questions' : 'Try again'}
              </button>
              <Link to={backTo} className="btn-ghost">
                Back to unit
              </Link>
            </div>
          </div>
        </section>
        {saveError && <ErrorNote message={saveError} />}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Review</h2>
          {questions.map((q, i) => {
            const right = chosen[i] === q.correctIndex
            return (
              <article key={i} className="card p-5">
                <p className="text-sm">
                  <span className={`mr-2 font-semibold ${right ? 'text-green' : 'text-ember'}`}>
                    {right ? '✓' : '✗'}
                  </span>
                  {q.question}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Answer: <span className="font-medium text-ink">{q.options[q.correctIndex]}</span>
                  {!right && chosen[i] !== undefined && <> · You chose: {q.options[chosen[i]]}</>}
                </p>
                {q.explanation && <p className="mt-2 text-sm text-muted">{q.explanation}</p>}
              </article>
            )
          })}
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to={backTo} className="text-sm text-muted transition hover:text-ink">
          ← Leave quiz
        </Link>
        <span className="nums eyebrow">
          {index + 1} / {questions.length}
        </span>
      </div>
      <ProgressBar value={((index + (picked !== undefined ? 1 : 0)) / questions.length) * 100} label="Quiz progress" />

      <section className="card p-6 sm:p-8">
        <p className="eyebrow">{title}</p>
        <h1 className="mt-3 font-sans text-xl leading-relaxed font-medium">{current.question}</h1>

        <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label="Options">
          {current.options.map((option, i) => {
            const selected = picked === i
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selected ? 'border-green bg-green-soft' : 'border-line hover:border-ink'
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
                    selected ? 'bg-green text-white' : 'bg-paper text-muted'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary py-2! text-sm"
          disabled={picked === undefined}
          onClick={() => (isLast ? void finish() : setIndex(index + 1))}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
