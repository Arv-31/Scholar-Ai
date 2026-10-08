import { useState } from 'react'
import { Link } from 'react-router-dom'
import ExamPicker from '../components/ExamPicker'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { getExam, getMyUnitProgress, getSyllabus } from '../services/examService'
import type { UnitProgress } from '../types/database'

// Exam Mode home: choose an exam, then see its subjects and units with progress.
export default function ExamHome() {
  const { profile, refreshProfile } = useShell()
  const [changing, setChanging] = useState(false)
  const examId = profile?.exam_id ?? null

  if (!profile) return <Loading />

  if (!examId || changing) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Exam mode"
          title="Choose your exam"
          action={
            changing && (
              <button type="button" className="btn-ghost" onClick={() => setChanging(false)}>
                Cancel
              </button>
            )
          }
        />
        <p className="max-w-xl text-muted">
          Pick the exam you are preparing for. You can switch any time.
        </p>
        <ExamPicker
          currentExamId={examId}
          onPicked={() => {
            setChanging(false)
            refreshProfile()
          }}
        />
      </div>
    )
  }

  return <Syllabus examId={examId} onChangeExam={() => setChanging(true)} />
}

function Syllabus({ examId, onChangeExam }: { examId: string; onChangeExam: () => void }) {
  const page = useLoad(
    async () => {
      const [exam, subjects, progress] = await Promise.all([
        getExam(examId),
        getSyllabus(examId),
        getMyUnitProgress(),
      ])
      return { exam, subjects, progress }
    },
    examId,
  )

  if (page.loading) return <Loading />
  if (page.error || !page.data) return <ErrorNote message={page.error ?? 'Not found'} onRetry={page.reload} />

  const { exam, subjects, progress } = page.data
  const units = subjects.flatMap((s) => s.units)
  const completed = units.filter((u) => progress[u.id]?.completed).length
  const percent = units.length ? (completed / units.length) * 100 : 0

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exam mode · Subjects"
        title={exam?.code ?? 'Your exam'}
        action={
          <button type="button" className="btn-ghost" onClick={onChangeExam}>
            Change exam
          </button>
        }
      />

      <section className="panel p-6 sm:p-8">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-green/30 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-white/50!">{exam?.name}</p>
            <p className="nums mt-2 font-display text-5xl">
              {completed}
              <span className="text-2xl text-white/40"> / {units.length} units</span>
            </p>
          </div>
          <p className="max-w-xs text-sm text-white/60">
            A unit is complete when you score 60% or more in any of its quiz rounds.
          </p>
        </div>
        <div className="relative mt-6">
          <ProgressBar value={percent} tone="light" label="Units completed" />
        </div>
      </section>

      {subjects.length === 0 && (
        <EmptyState title="No subjects yet" text="Content for this exam is still being added." />
      )}

      {subjects.map((subject, sIndex) => {
        const done = subject.units.filter((u) => progress[u.id]?.completed).length
        return (
          <section key={subject.id}>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold">
                <span className="nums mr-2 text-sm text-muted">{String(sIndex + 1).padStart(2, '0')}</span>
                {subject.name}
              </h2>
              <span className="nums eyebrow shrink-0">
                {done}/{subject.units.length} done
              </span>
            </div>
            <ul className="card divide-y divide-line overflow-hidden">
              {subject.units.map((unit) => (
                <li key={unit.id}>
                  <UnitRow id={unit.id} name={unit.name} progress={progress[unit.id]} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function UnitRow({ id, name, progress }: { id: string; name: string; progress?: UnitProgress }) {
  const status = progress?.completed ? 'Complete' : progress ? 'In progress' : 'Not started'
  const dot = progress?.completed ? 'bg-green' : progress ? 'bg-ember' : 'bg-line'

  return (
    <Link
      to={`/exam/unit/${id}`}
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-paper"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        <span className="text-xs text-muted">{status}</span>
      </span>
      {progress && (
        <span className="nums text-right text-sm">
          <span className="block font-semibold">{Math.round(progress.last_percent)}%</span>
          <span className="text-xs text-muted">last score</span>
        </span>
      )}
      <span aria-hidden="true" className="text-muted">
        →
      </span>
    </Link>
  )
}
