import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { getNotes } from '../services/contentService'
import { getSubtopic } from '../services/examService'

const PARTS = ['What it is', 'How it works', 'In the exam']

// Study notes for one subtopic: three short paragraphs, then key points and formulas.
// Made to be read in about five minutes, or printed / saved as a PDF.
export default function NotesPage() {
  const { subtopicId = '' } = useParams()
  const page = useLoad(async () => {
    const subtopic = await getSubtopic(subtopicId)
    if (!subtopic) return null
    const notes = await getNotes(subtopic.exam.code, subtopic.unit.name, subtopic.name)
    return { subtopic, notes }
  }, subtopicId)

  if (page.loading) return <Loading />
  if (page.error) return <ErrorNote message={page.error} onRetry={page.reload} />
  if (!page.data) {
    return (
      <EmptyState
        title="Subtopic not found"
        text="It may have been renamed. Pick it again from its unit."
        action={
          <Link to="/exam" className="btn-primary py-2! text-sm">
            All subjects
          </Link>
        }
      />
    )
  }

  const { subtopic, notes } = page.data
  const index = subtopic.siblings.findIndex((s) => s.id === subtopic.id)
  const prev = index > 0 ? subtopic.siblings[index - 1] : null
  const next = index >= 0 ? (subtopic.siblings[index + 1] ?? null) : null

  return (
    <div className="space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted print:hidden"
      >
        <Link to="/exam" className="hover:text-ink">
          ← All subjects
        </Link>
        <span aria-hidden="true">/</span>
        <span>{subtopic.subject}</span>
        <span aria-hidden="true">/</span>
        <Link to={`/exam/unit/${subtopic.unit.id}`} className="hover:text-ink">
          {subtopic.unit.name}
        </Link>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {subtopic.exam.code} · {subtopic.subject} · {subtopic.unit.name}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{subtopic.name}</h1>
        </div>
        {notes && (
          <button type="button" className="btn-ghost print:hidden" onClick={() => window.print()}>
            Print / save PDF
          </button>
        )}
      </header>

      {!notes ? (
        <EmptyState
          title="Notes are being written"
          text="Watch the videos and try the quiz rounds for this unit meanwhile."
          action={
            <Link to={`/exam/unit/${subtopic.unit.id}`} className="btn-primary py-2! text-sm">
              Open {subtopic.unit.name}
            </Link>
          }
        />
      ) : (
        <>
          <article className="card space-y-6 p-6 sm:p-10">
            {notes.paragraphs.map((text, i) => (
              <section key={PARTS[i]} className="grid gap-2 md:grid-cols-[150px_minmax(0,1fr)]">
                <h2 className="eyebrow pt-1 font-sans!">
                  <span className="nums mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {PARTS[i]}
                </h2>
                <p className="max-w-prose text-[17px] leading-relaxed">{text}</p>
              </section>
            ))}
          </article>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="card p-6 break-inside-avoid">
              <h2 className="eyebrow mb-4 font-sans!">Key points</h2>
              <ul className="space-y-2.5">
                {notes.keyPoints.map((point) => (
                  <li key={point} className="border-l-4 border-green pl-3 leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel p-6 break-inside-avoid">
              <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.05]" />
              <h2 className="eyebrow relative mb-4 font-sans! text-white/50!">
                {notes.formulasTitle ?? 'Formulas'}
              </h2>
              <ul className="relative space-y-2.5">
                {notes.formulas.map((formula) => (
                  <li key={formula} className="nums leading-relaxed text-white/90">
                    {formula}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="text-xs text-muted">
            Notes written for ScholarAI from the exam syllabus. Always confirm with your official
            exam notice.
          </p>
        </>
      )}

      <nav aria-label="More subtopics" className="grid gap-3 sm:grid-cols-3 print:hidden">
        {prev ? (
          <Link to={`/exam/notes/${prev.id}`} className="card p-4">
            <p className="eyebrow">← Previous</p>
            <p className="mt-1 font-medium">{prev.name}</p>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        <Link to={`/exam/unit/${subtopic.unit.id}`} className="card p-4 text-center">
          <p className="eyebrow">Next step</p>
          <p className="mt-1 font-medium">Watch & practise</p>
        </Link>
        {next ? (
          <Link to={`/exam/notes/${next.id}`} className="card p-4 text-right">
            <p className="eyebrow">Next →</p>
            <p className="mt-1 font-medium">{next.name}</p>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
      </nav>
    </div>
  )
}
