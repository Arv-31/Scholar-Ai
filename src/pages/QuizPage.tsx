import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import WhyWrong from '../components/WhyWrong'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { PASS_PERCENT, ROUNDS, scoreQuiz, type QuizQuestion } from '../lib/quiz'
import { getSubtopic, getUnit } from '../services/examService'
import { errorMessage } from '../services/functionsClient'
import { getQuickCheck, getSubtopicRound, getSubtopics, saveAttempt } from '../services/quizService'
import type { Round, Subtopic } from '../types/database'

const LETTERS = ['A', 'B', 'C', 'D']

// What a finished quiz is saved as. Quick checks after a video are practice only (no target).
type Target = { unitId: string; subtopicId: string; round: Round }

// Two kinds of quiz share this screen:
//   /exam/subtopic/:subtopicId/round/:round  one of the 10 saved rounds of a subtopic
//   /exam/unit/:unitId/check                 3 random questions after watching a video
export default function QuizPage() {
  const { unitId, subtopicId, round: roundParam } = useParams()
  const round = Math.min(ROUNDS, Math.max(1, Number(roundParam) || 1))
  // Bumping `attempt` starts the same round again from the first question.
  const [attempt, setAttempt] = useState(0)

  const page = useLoad(
    async () => {
      if (subtopicId) {
        const sub = await getSubtopic(subtopicId)
        if (!sub) return null
        return {
          title: `${sub.name} · Round ${round}`,
          questions: await getSubtopicRound(subtopicId, round),
          subtopics: [{ id: sub.id, unit_id: sub.unit.id, name: sub.name, sort_order: 0 }],
          backTo: `/exam/unit/${sub.unit.id}`,
          target: { unitId: sub.unit.id, subtopicId, round } as Target | null,
          nextRound: round < ROUNDS ? `/exam/subtopic/${subtopicId}/round/${round + 1}` : null,
        }
      }
      const [unit, questions, subtopics] = await Promise.all([
        getUnit(unitId ?? ''),
        getQuickCheck(unitId ?? ''),
        getSubtopics(unitId ?? ''),
      ])
      return {
        title: `${unit?.name ?? 'Unit'} · Quick check`,
        questions,
        subtopics,
        backTo: `/exam/unit/${unitId}`,
        target: null,
        nextRound: null,
      }
    },
    `${subtopicId ?? unitId}-${round}-${attempt}`,
  )

  if (page.loading) return <Loading />
  if (page.error) return <ErrorNote message={page.error} onRetry={page.reload} />
  if (!page.data || page.data.questions.length === 0) {
    return (
      <EmptyState
        title="Questions coming soon"
        text="This round has no questions yet. Try another round of this subtopic."
        action={
          <Link to={page.data?.backTo ?? '/exam'} className="btn-ghost">
            Back to unit
          </Link>
        }
      />
    )
  }

  return (
    <Quiz
      key={`${subtopicId}-${round}-${attempt}`}
      title={page.data.title}
      questions={page.data.questions}
      subtopics={page.data.subtopics}
      target={page.data.target}
      backTo={page.data.backTo}
      nextRound={page.data.nextRound}
      onRetry={() => setAttempt((a) => a + 1)}
    />
  )
}

type QuizProps = {
  title: string
  questions: QuizQuestion[]
  subtopics: Subtopic[]
  target: Target | null // null = quick check, practice only
  backTo: string
  nextRound: string | null
  onRetry: () => void
}

function Quiz({ title, questions, subtopics, target, backTo, nextRound, onRetry }: QuizProps) {
  const quick = target === null
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
    if (!target) return // practice only: not saved, so it can never complete anything
    try {
      await saveAttempt(target, questions, chosen)
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
          <div className="relative">
            <p className="eyebrow text-white/50!">{title}</p>
            <p
              className={`nums mt-3 text-7xl font-semibold ${result.passed ? 'text-[#4cbf8a]' : 'text-ember'}`}
            >
              {result.percent}%
            </p>
            <p className="nums mt-2 text-white/70">
              {result.score} of {result.total} correct
            </p>
            <p className="mt-4 text-sm text-white/60">
              {quick
                ? 'Quick check: practice only, it does not count towards completing anything.'
                : result.passed
                  ? 'Subtopic complete. Nice work.'
                  : `Score ${PASS_PERCENT}% or more to complete this subtopic. Look at the answers below and try again.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary py-2! text-sm" onClick={onRetry}>
                Try again
              </button>
              {nextRound && (
                <Link to={nextRound} className="btn-ghost">
                  Next round →
                </Link>
              )}
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
            const subtopic = subtopics.find((t) => t.id === q.subtopicId)
            return (
              <article key={i} className="card p-5">
                {subtopic && <p className="eyebrow mb-1.5">{subtopic.name}</p>}
                <p className="text-sm">
                  <span className="nums mr-2 text-muted">{String(i + 1).padStart(2, '0')}</span>
                  {q.question}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 border border-ink bg-green px-2 py-1 text-on-accent">
                    <span className="nums font-semibold">{LETTERS[q.correctIndex]}</span>
                    {q.options[q.correctIndex]}
                  </span>
                  {!right && chosen[i] !== undefined && (
                    <span className="inline-flex items-center gap-2 border border-line px-2 py-1 text-muted line-through decoration-ember decoration-2">
                      <span className="nums">{LETTERS[chosen[i]]}</span>
                      {q.options[chosen[i]]}
                    </span>
                  )}
                </div>
                {q.explanation && <p className="mt-2 text-sm text-muted">{q.explanation}</p>}
                {!right && chosen[i] !== undefined && <WhyWrong question={q} chosen={chosen[i]} />}
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
      <ProgressBar
        value={((index + (picked !== undefined ? 1 : 0)) / questions.length) * 100}
        label="Quiz progress"
      />

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
                className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-ink bg-green-soft shadow-[3px_3px_0_var(--color-ink)]'
                    : 'border-line hover:border-ink'
                }`}
              >
                <span
                  className={`nums grid h-7 w-7 shrink-0 place-items-center border border-ink text-xs font-semibold ${
                    selected ? 'bg-green text-on-accent' : 'bg-paper text-ink'
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
