import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { lastDays, localDay, shortDate } from '../lib/dates'
import { PASS_PERCENT } from '../lib/quiz'
import { liveStreak } from '../lib/streak'
import { getProgressOverview, WATCHED_PERCENT } from '../services/progressService'

// Progress analytics: units, scores, streak history and recent quiz attempts.
export default function ProgressPage() {
  const { profile } = useShell()
  const today = localDay()
  const examId = profile?.exam_id ?? null

  const page = useLoad(() => getProgressOverview(examId, today), `${examId}-${today}`)

  if (!profile || page.loading) return <Loading />
  if (page.error || !page.data) return <ErrorNote message={page.error ?? 'Could not load'} onRetry={page.reload} />

  const { exam, subjects, unitProgress, attempts, videosWatched, completionCounts } = page.data
  const units = subjects.flatMap((s) => s.units)
  const completed = units.filter((u) => unitProgress[u.id]?.completed).length
  const tried = units.filter((u) => unitProgress[u.id])
  const averageBest = tried.length
    ? Math.round(tried.reduce((sum, u) => sum + unitProgress[u.id].best_percent, 0) / tried.length)
    : null
  const streak = liveStreak(profile.current_streak, profile.last_streak_date, today)

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Progress" title="How you’re doing" />

      {/* Headline numbers */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Units complete"
          value={exam ? `${completed}/${units.length}` : '—'}
          note={exam ? exam.code : 'Choose an exam'}
          dot="bg-green"
        />
        <StatTile
          label="Average best score"
          value={averageBest === null ? '—' : `${averageBest}%`}
          note={tried.length ? `Across ${tried.length} unit${tried.length === 1 ? '' : 's'}` : 'No quizzes yet'}
          dot="bg-green"
        />
        <StatTile
          label="Current streak"
          value={`${streak}`}
          note={`Best ${profile.best_streak} day${profile.best_streak === 1 ? '' : 's'}`}
          dot="bg-ember"
        />
        <StatTile
          label="Videos watched"
          value={`${videosWatched}`}
          note={`At least ${WATCHED_PERCENT}% watched`}
          dot="bg-green"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Subjects */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Subjects</h2>
          <p className="text-sm text-muted">Units scored {PASS_PERCENT}%+ out of all units</p>
          {!exam ? (
            <div className="mt-5">
              <EmptyState
                title="No exam chosen"
                text="Pick your exam in Exam mode to see subject progress."
                action={
                  <Link to="/exam" className="btn-primary py-2! text-sm">
                    Choose exam
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {subjects.map((subject) => {
                const done = subject.units.filter((u) => unitProgress[u.id]?.completed).length
                const total = subject.units.length
                return (
                  <li key={subject.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{subject.name}</span>
                      <span className="nums shrink-0 text-muted">
                        {done}/{total}
                      </span>
                    </div>
                    <ProgressBar value={total ? (done / total) * 100 : 0} label={`${subject.name}: ${done} of ${total} units`} />
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Consistency */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Last 28 days</h2>
          <p className="text-sm text-muted">Comfort Zone tasks done each day</p>
          <ConsistencyGrid counts={completionCounts} today={today} />
        </section>
      </div>

      {/* Recent attempts */}
      <section className="card overflow-hidden">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-semibold">Recent quizzes</h2>
        </div>
        {attempts.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState title="No quizzes yet" text="Open any unit in Exam mode and start Round 1." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="eyebrow px-6 py-2 font-medium">Unit</th>
                  <th className="eyebrow px-3 py-2 font-medium">Round</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Score</th>
                  <th className="eyebrow px-6 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="transition hover:bg-paper">
                    <td className="max-w-56 truncate px-6 py-3">
                      <Link to={`/exam/unit/${attempt.unit_id}`} className="hover:underline">
                        {attempt.unit_name}
                      </Link>
                    </td>
                    <td className="nums px-3 py-3 text-muted">{attempt.round === 3 ? '3 · AI' : attempt.round}</td>
                    <td className="nums px-3 py-3 text-right">
                      <span className="text-muted">
                        {attempt.score}/{attempt.total}
                      </span>{' '}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          attempt.percent >= PASS_PERCENT ? 'bg-green-soft text-green' : 'bg-ember-soft text-ember'
                        }`}
                      >
                        {Math.round(attempt.percent)}%
                      </span>
                    </td>
                    <td className="nums px-6 py-3 text-right text-muted">{shortDate(attempt.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatTile({ label, value, note, dot }: { label: string; value: string; note: string; dot: string }) {
  return (
    <div className="card p-5">
      <p className="eyebrow flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
        {label}
      </p>
      <p className="nums mt-3 font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1 truncate text-xs text-muted">{note}</p>
    </div>
  )
}

const CELL = ['bg-line', 'bg-ember/40', 'bg-ember']
const CELL_LABEL = ['No tasks', '1 of 2 tasks', 'Both tasks']

// 4 rows of 7 days. Hover (or long-press) a square to see the date.
function ConsistencyGrid({ counts, today }: { counts: Record<string, number>; today: string }) {
  const days = lastDays(28, today)
  const fullDays = days.filter((d) => (counts[d] ?? 0) >= 2).length

  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const level = Math.min(counts[day] ?? 0, 2)
          const label = `${shortDate(day)}: ${CELL_LABEL[level]}`
          return (
            <div
              key={day}
              title={label}
              aria-label={label}
              role="img"
              className={`aspect-square rounded-md transition hover:scale-110 ${CELL[level]} ${
                day === today ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''
              }`}
            />
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span className="nums">{fullDays} full days</span>
        <span className="flex items-center gap-3">
          {CELL.map((cell, i) => (
            <span key={cell} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${cell}`} aria-hidden="true" />
              {CELL_LABEL[i]}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
