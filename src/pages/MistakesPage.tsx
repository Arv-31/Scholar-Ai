import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import WhyWrong from '../components/WhyWrong'
import { useLoad } from '../hooks/useLoad'
import { CLEAR_AFTER, getMistakes, recordReview, type Mistake } from '../services/mistakeService'

const LETTERS = ['A', 'B', 'C', 'D']

// Mistake notebook: every question answered wrong in a quiz lands here automatically.
// Practise only these; answer one right twice in a row and it leaves the notebook.
export default function MistakesPage() {
  const page = useLoad(getMistakes)
  const [practice, setPractice] = useState<Mistake[] | null>(null)

  if (page.loading) return <Loading />
  if (page.error || !page.data)
    return <ErrorNote message={page.error ?? 'Could not load'} onRetry={page.reload} />

  if (practice) {
    return (
      <Practice
        queue={practice}
        onDone={() => {
          setPractice(null)
          page.reload()
        }}
      />
    )
  }

  const groups = page.data
  const total = groups.reduce((sum, g) => sum + g.mistakes.length, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exam mode · Mistake notebook"
        title="Your mistakes"
        action={
          total > 0 && (
            <button
              type="button"
              className="btn-primary py-2! text-sm"
              onClick={() => setPractice(groups.flatMap((g) => g.mistakes))}
            >
              Practise all {total}
            </button>
          )
        }
      />
      <p className="-mt-4 max-w-2xl text-muted">
        Every question you get wrong in a quiz is saved here. Get it right {CLEAR_AFTER} times in a
        row and it leaves the notebook. Get it wrong in a quiz again and it comes back.
      </p>

      {total === 0 ? (
        <EmptyState
          title="No mistakes to revise"
          text="Wrong answers from your quizzes show up here automatically."
          action={
            <Link to="/exam" className="btn-primary py-2! text-sm">
              Go to subjects
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group, i) => (
            <Reveal key={group.unitId} index={i}>
              <section className="card flex h-full flex-col gap-3 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold">{group.unitName}</h2>
                  <span className="nums eyebrow shrink-0">{group.mistakes.length} to revise</span>
                </div>
                <ul className="flex-1 space-y-1.5 text-sm text-muted">
                  {group.mistakes.slice(0, 3).map((m) => (
                    <li key={m.question} className="truncate border-l-4 border-ember pl-2">
                      {m.question}
                    </li>
                  ))}
                  {group.mistakes.length > 3 && <li>and {group.mistakes.length - 3} more</li>}
                </ul>
                <button
                  type="button"
                  className="btn-ghost self-start"
                  onClick={() => setPractice(group.mistakes)}
                >
                  Practise these
                </button>
              </section>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

function Practice({ queue, onDone }: { queue: Mistake[]; onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [cleared, setCleared] = useState(0)
  const [unsaved, setUnsaved] = useState(false)
  const current = queue[index]

  async function choose(option: number) {
    if (picked !== null) return
    setPicked(option)
    const right = option === current.correct
    if (right && current.rightStreak + 1 >= CLEAR_AFTER) setCleared((c) => c + 1)
    const saved = await recordReview(current, right)
    if (!saved) setUnsaved(true)
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <section className="panel p-8 text-center">
          <p className="eyebrow text-white/50!">Revision done</p>
          <p className="nums mt-3 text-6xl font-semibold text-ember">{cleared}</p>
          <p className="mt-2 text-white/70">
            question{cleared === 1 ? '' : 's'} cleared from your notebook
          </p>
          <button type="button" className="btn-primary mt-6 py-2! text-sm" onClick={onDone}>
            Back to notebook
          </button>
        </section>
      </div>
    )
  }

  const right = picked === current.correct
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button type="button" className="text-sm text-muted hover:text-ink" onClick={onDone}>
          ← Stop revising
        </button>
        <span className="nums eyebrow">
          {index + 1} / {queue.length}
        </span>
      </div>
      {unsaved && (
        <p className="bg-ember-soft px-3 py-2 text-sm">
          Revision progress will be saved once the latest database update is applied.
        </p>
      )}
      <section className="card p-6 sm:p-8">
        <p className="eyebrow">
          Right {current.rightStreak}/{CLEAR_AFTER} times so far
        </p>
        <h1 className="mt-3 font-sans text-xl leading-relaxed font-medium">{current.question}</h1>
        <div className="mt-6 grid gap-2.5">
          {current.options.map((option, i) => {
            const isCorrect = picked !== null && i === current.correct
            const isWrongPick = picked === i && i !== current.correct
            return (
              <button
                key={i}
                type="button"
                onClick={() => void choose(i)}
                disabled={picked !== null}
                className={`flex items-center gap-3 border px-4 py-3 text-left transition ${
                  isCorrect
                    ? 'border-ink bg-green-soft'
                    : isWrongPick
                      ? 'border-line text-muted line-through decoration-ember decoration-2'
                      : 'cursor-pointer border-line hover:border-ink'
                }`}
              >
                <span
                  className={`nums grid h-7 w-7 shrink-0 place-items-center border border-ink text-xs font-semibold ${
                    isCorrect ? 'bg-green text-on-accent' : 'bg-paper'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                {option}
              </button>
            )
          })}
        </div>
        {picked !== null && !right && (
          <WhyWrong
            question={{
              question: current.question,
              options: current.options,
              correctIndex: current.correct,
            }}
            chosen={picked}
          />
        )}
      </section>
      {picked !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-primary py-2! text-sm"
            onClick={() => {
              setPicked(null)
              setIndex(index + 1)
            }}
          >
            {index + 1 < queue.length ? 'Next' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  )
}
