import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { shortDate } from '../lib/dates'
import { EXAM_RULES, scoreMock, type ExamRules, type MockResult } from '../lib/examRules'
import { getExam } from '../services/examService'
import { buildMock, listMocks, saveMock, type MockQuestion } from '../services/mockService'

const LETTERS = ['A', 'B', 'C', 'D']

// Timed mock test with the exam's real marking (negative marks included):
// it trains strategy, i.e. when to answer and when to skip.
export default function MockTestPage() {
  const { profile } = useShell()
  const examId = profile?.exam_id ?? null
  const page = useLoad(async () => {
    if (!examId) return null
    const [exam, history] = await Promise.all([getExam(examId), listMocks(examId)])
    return { exam, history }
  }, examId ?? '')
  const [test, setTest] = useState<{ questions: MockQuestion[]; rules: ExamRules } | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  if (!profile || page.loading) return <Loading />
  if (!examId) {
    return (
      <EmptyState
        title="Choose your exam first"
        text="The mock test follows your exam's own marking scheme."
        action={
          <Link to="/exam" className="btn-primary py-2! text-sm">
            Choose exam
          </Link>
        }
      />
    )
  }
  if (page.error || !page.data?.exam)
    return <ErrorNote message={page.error ?? 'Not found'} onRetry={page.reload} />

  const { exam, history } = page.data
  const rules = EXAM_RULES[exam.code]
  if (!rules)
    return <EmptyState title="No mock test yet" text="There are no mock rules for this exam yet." />

  if (test) {
    return (
      <MockRun
        examId={exam.id}
        rules={test.rules}
        questions={test.questions}
        onExit={() => {
          setTest(null)
          page.reload()
        }}
      />
    )
  }

  const total = rules.sections.reduce((n, s) => n + s.count, 0)

  async function start() {
    setStarting(true)
    setStartError(null)
    try {
      setTest({ questions: await buildMock(exam!.id, rules), rules })
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Could not start the test.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Exam mode · ${exam.code}`} title="Timed mock test" />
      <section className="panel p-6 sm:p-8">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
        <div className="relative grid gap-6 sm:grid-cols-3">
          <div>
            <p className="eyebrow text-white/50!">Questions</p>
            <p className="nums mt-2 font-display text-4xl">{total}</p>
          </div>
          <div>
            <p className="eyebrow text-white/50!">Time</p>
            <p className="nums mt-2 font-display text-4xl">{rules.minutes} min</p>
          </div>
          <div>
            <p className="eyebrow text-white/50!">Marking</p>
            <p className="mt-2 text-sm text-white/70">{rules.note}</p>
          </div>
        </div>
        <p className="relative mt-6 text-sm text-white/60">
          A shorter version of the real paper with the same marks per question. Skipping costs
          nothing; a wrong guess can cost marks. The test ends when time runs out.
        </p>
        <button
          type="button"
          className="btn-ember relative mt-6"
          disabled={starting}
          onClick={() => void start()}
        >
          {starting ? 'Preparing…' : 'Start mock test'}
        </button>
        {startError && <p className="relative mt-3 text-sm text-ember">{startError}</p>}
      </section>

      <section className="card overflow-hidden">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-semibold">Your last mocks</h2>
        </div>
        {history.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted">No mock tests yet.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {history.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm"
              >
                <span className="nums">
                  {m.score} / {m.max_score}
                </span>
                <span className="nums text-muted">
                  {m.correct} right · {m.wrong} wrong · {m.skipped} skipped ·{' '}
                  {Math.round(m.seconds / 60)} min
                </span>
                <span className="nums text-muted">{shortDate(m.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function MockRun({
  examId,
  rules,
  questions,
  onExit,
}: {
  examId: string
  rules: ExamRules
  questions: MockQuestion[]
  onExit: () => void
}) {
  const [chosen, setChosen] = useState<(number | null)[]>(() => questions.map(() => null))
  const [index, setIndex] = useState(0)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [result, setResult] = useState<MockResult | null>(null)
  const [saved, setSaved] = useState<boolean | null>(null)
  const limit = rules.minutes * 60
  const elapsed = Math.floor((now - startedAt) / 1000)
  const left = Math.max(0, limit - elapsed)

  async function submit() {
    if (result) return
    const scored = scoreMock(
      rules,
      questions.map((q, i) => ({ section: q.section, chosen: chosen[i], correct: q.correct })),
    )
    setResult(scored)
    setSaved(
      await saveMock(examId, scored, Math.min(limit, Math.floor((Date.now() - startedAt) / 1000))),
    )
  }

  // the clock; the test submits itself when time runs out
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })
  useEffect(() => {
    if (result) return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t - startedAt >= limit * 1000) void submitRef.current()
    }, 1000)
    return () => window.clearInterval(id)
  }, [result, startedAt, limit])

  if (result) {
    const accuracy =
      result.correct + result.wrong
        ? Math.round((result.correct / (result.correct + result.wrong)) * 100)
        : 0
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="panel p-6 text-center sm:p-10">
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
          <div className="relative">
            <p className="eyebrow text-white/50!">Mock test result</p>
            <p className="nums mt-3 text-6xl font-semibold text-ember">
              {result.score}
              <span className="text-2xl text-white/40"> / {result.maxScore}</span>
            </p>
            <div className="nums mt-5 grid grid-cols-2 gap-3 text-sm text-white/70 sm:grid-cols-4">
              <span>{result.correct} right</span>
              <span>{result.wrong} wrong</span>
              <span>{result.skipped} skipped</span>
              <span>{accuracy}% accuracy</span>
            </div>
            <p className="mt-5 text-sm text-white/60">
              {result.lostToGuessing > 0
                ? `Wrong answers cost you ${result.lostToGuessing} marks. Skipping the unsure ones would have kept them.`
                : 'No marks lost to guessing. Good judgement.'}
            </p>
            {saved === false && (
              <p className="mt-3 text-xs text-white/50">
                This result will be saved to your history once the latest database update is
                applied.
              </p>
            )}
            <button type="button" className="btn-primary mt-6 py-2! text-sm" onClick={onExit}>
              Done
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Review</h2>
          {questions.map((q, i) => (
            <article key={i} className="card p-5 text-sm">
              <p className="eyebrow mb-1.5">{rules.sections[q.section].subject}</p>
              <p>
                <span className="nums mr-2 text-muted">{String(i + 1).padStart(2, '0')}</span>
                {q.question}
              </p>
              <p className="mt-2 text-muted">
                Answer:{' '}
                <span className="text-ink">
                  {LETTERS[q.correct]}. {q.options[q.correct]}
                </span>
                {chosen[i] === null
                  ? ' · skipped'
                  : chosen[i] !== q.correct && ` · you chose ${LETTERS[chosen[i]!]}`}
              </p>
            </article>
          ))}
        </section>
      </div>
    )
  }

  const current = questions[index]
  const section = rules.sections[current.section]
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">
            {section.subject} · +{section.right}
            {section.wrong > 0 ? ` / −${section.wrong}` : ' · no negative'}
          </p>
          <span className="nums eyebrow">
            {index + 1} / {questions.length}
          </span>
        </div>
        <h1 className="mt-3 font-sans text-xl leading-relaxed font-medium">{current.question}</h1>
        <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label="Options">
          {current.options.map((option, i) => {
            const selected = chosen[index] === i
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setChosen(chosen.map((c, k) => (k === index ? (selected ? null : i) : c)))
                }
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
        <p className="mt-3 text-xs text-muted">Tap the chosen option again to clear it (skip).</p>
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            className="btn-ghost"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            Back
          </button>
          {index + 1 < questions.length ? (
            <button
              type="button"
              className="btn-primary py-2! text-sm"
              onClick={() => setIndex(index + 1)}
            >
              Next
            </button>
          ) : (
            <button type="button" className="btn-ember py-2! text-sm" onClick={() => void submit()}>
              Submit test
            </button>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <section className={`panel p-5 ${left < 60 ? 'ring-2 ring-ember' : ''}`}>
          <p className="eyebrow text-white/50!">Time left</p>
          <p className="nums mt-2 font-display text-4xl" role="timer" aria-live="off">
            {mm}:{ss}
          </p>
        </section>
        <section className="card p-4">
          <p className="eyebrow mb-3">Questions</p>
          <div className="grid grid-cols-6 gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${chosen[i] === null ? '' : ', answered'}`}
                className={`nums h-8 cursor-pointer border text-xs ${
                  i === index
                    ? 'border-ink bg-ink text-paper'
                    : chosen[i] === null
                      ? 'border-line'
                      : 'border-ink bg-green-soft'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-ember mt-4 w-full py-2! text-sm"
            onClick={() => void submit()}
          >
            Submit test
          </button>
        </section>
      </aside>
    </div>
  )
}
