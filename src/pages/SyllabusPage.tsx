import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import SyllabusGraph from '../components/SyllabusGraph'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { getSyllabusMap } from '../services/contentService'
import {
  getExam,
  getExamSubtopicIds,
  getMyUnitProgress,
  getSyllabus,
} from '../services/examService'

// Bar colours for the weightage strip, one per subject (in order)
const SHADES = ['bg-green', 'bg-ember', 'bg-ink', 'bg-muted', 'bg-line']

// The whole exam on one page: pattern, weightage, a clickable map of every subtopic,
// how important each part is, and the standard books to study from.
export default function SyllabusPage() {
  const { profile } = useShell()
  const examId = profile?.exam_id ?? null
  const page = useLoad(async () => {
    if (!examId) return null
    const exam = await getExam(examId)
    if (!exam) return null
    const [map, subjects, progress] = await Promise.all([
      getSyllabusMap(exam.code),
      getSyllabus(examId),
      getMyUnitProgress().catch(() => ({})),
    ])
    const subtopicIds = await getExamSubtopicIds(subjects)
    const unitName = new Map(subjects.flatMap((s) => s.units).map((u) => [u.id, u.name]))
    const completedUnits = new Set(
      Object.values(progress)
        .filter((p) => p.completed)
        .map((p) => unitName.get(p.unit_id))
        .filter((name): name is string => Boolean(name)),
    )
    return { exam, map, subtopicIds, completedUnits }
  }, examId ?? '')

  if (!profile || page.loading) return <Loading />
  if (!examId) {
    return (
      <EmptyState
        title="Choose your exam first"
        text="The syllabus map shows the full syllabus of your exam."
        action={
          <Link to="/exam" className="btn-primary py-2! text-sm">
            Choose exam
          </Link>
        }
      />
    )
  }
  if (page.error || !page.data)
    return <ErrorNote message={page.error ?? 'Not found'} onRetry={page.reload} />

  const { exam, map, subtopicIds, completedUnits } = page.data
  if (!map) return <EmptyState title="No map yet" text="This exam has no syllabus map yet." />

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={`Exam mode · ${exam.code}`} title="Syllabus map" />

      <Reveal index={0}>
        <section className="panel p-6 sm:p-8">
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
          <p className="eyebrow relative text-white/50!">{exam.name} · exam pattern</p>
          <dl className="relative mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {map.pattern.map((item) => (
              <div key={item.label}>
                <dt className="eyebrow text-white/45!">{item.label}</dt>
                <dd className="nums mt-1.5 text-lg text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      <Reveal index={1}>
        <section className="card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Weightage</h2>
          <p className="mt-1 text-sm text-muted">Share of the total marks for each part.</p>
          <div className="mt-5 flex h-9 overflow-hidden border border-ink">
            {map.sections.map((s, i) => (
              <div
                key={s.subject}
                title={`${s.subject}: ${s.weight}%`}
                className={`${SHADES[i % SHADES.length]} ${s.inApp ? '' : 'opacity-40'} border-r border-ink last:border-r-0`}
                style={{ width: `${s.weight}%` }}
              />
            ))}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {map.sections.map((s, i) => (
              <li key={s.subject} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={`mt-1 h-3 w-3 shrink-0 border border-ink ${SHADES[i % SHADES.length]} ${s.inApp ? '' : 'opacity-40'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{s.subject}</span>
                  <span className="nums block text-muted">
                    {s.weight}% · {s.questions}
                    {!s.inApp && ' · not in ScholarAI yet'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted">{map.weightNote}</p>
        </section>
      </Reveal>

      <Reveal index={2}>
        <section>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold">The map</h2>
            <p className="text-sm text-muted">Click a subtopic to open its notes.</p>
          </div>
          <div className="card overflow-x-auto p-4 sm:p-6">
            <SyllabusGraph
              examCode={exam.code}
              sections={map.sections}
              subtopicIds={subtopicIds}
              completedUnits={completedUnits}
            />
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-ink bg-ember" /> Must-do (asked
              almost every year)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-ink bg-green" /> Regular
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-ink" /> Less frequent
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ember">●●●</span> Unit importance
            </li>
            <li>Thicker branch = more marks · ✓ = unit completed</li>
          </ul>
        </section>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Reveal index={3}>
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Best books</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {map.books.map((group) => (
                <article key={group.subject} className="card p-5">
                  <p className="eyebrow mb-3">{group.subject}</p>
                  <ul className="space-y-3">
                    {group.items.map((book) => (
                      <li key={book.title}>
                        <p className="font-medium leading-snug">{book.title}</p>
                        <p className="text-sm text-muted">{book.author}</p>
                        <p className="mt-0.5 text-sm">{book.use}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
        <Reveal index={4}>
          <section className="panel h-full p-6">
            <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
            <h2 className="relative text-xl font-semibold">How to use this map</h2>
            <ol className="relative mt-4 space-y-3 text-sm text-white/80">
              {map.plan.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="nums text-ember">{String(i + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
