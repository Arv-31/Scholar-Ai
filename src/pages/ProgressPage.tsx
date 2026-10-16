import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PaperIcon from '../components/paper/PaperIcon'
import ProgressBar from '../components/ProgressBar'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { lastDays, localDay, shortDate } from '../lib/dates'
import { ACHIEVED_PERCENT, type UnitMastery } from '../lib/mastery'
import type { UnitProgress } from '../types/database'
import { PASS_PERCENT } from '../lib/quiz'
import { liveStreak } from '../lib/streak'
import { getProgressOverview, WATCHED_PERCENT } from '../services/progressService'
import type { SubjectWithUnits } from '../services/examService'

// Progress analytics: units, scores, streak history and recent quiz attempts.
export default function ProgressPage() {
  const { profile } = useShell()
  const today = localDay()
  const examId = profile?.exam_id ?? null

  const page = useLoad(() => getProgressOverview(examId, today), `${examId}-${today}`)

  if (!profile || page.loading) return <Loading />
  if (page.error || !page.data)
    return <ErrorNote message={page.error ?? 'Could not load'} onRetry={page.reload} />

  const { exam, subjects, unitProgress, attempts, videosWatched, completionCounts, mastery } =
    page.data
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
          note={
            tried.length
              ? `Across ${tried.length} unit${tried.length === 1 ? '' : 's'}`
              : 'No quizzes yet'
          }
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

      {exam && <Heatmap subjects={subjects} unitProgress={unitProgress} />}

      {exam && <Achievements subjects={subjects} mastery={mastery} />}

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
                    <ProgressBar
                      value={total ? (done / total) * 100 : 0}
                      label={`${subject.name}: ${done} of ${total} units`}
                    />
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
            <EmptyState
              title="No quizzes yet"
              text="Open any unit in Exam mode and start Round 1."
            />
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
                    <td className="nums px-3 py-3 text-muted">
                      {attempt.round}
                    </td>
                    <td className="nums px-3 py-3 text-right">
                      <span className="text-muted">
                        {attempt.score}/{attempt.total}
                      </span>{' '}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          attempt.percent >= PASS_PERCENT
                            ? 'bg-green-soft text-green'
                            : 'bg-ember-soft text-ember'
                        }`}
                      >
                        {Math.round(attempt.percent)}%
                      </span>
                    </td>
                    <td className="nums px-6 py-3 text-right text-muted">
                      {shortDate(attempt.created_at)}
                    </td>
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

// The whole syllabus at a glance: one square per unit, coloured by best quiz score.
function Heatmap({
  subjects,
  unitProgress,
}: {
  subjects: SubjectWithUnits[]
  unitProgress: Record<string, UnitProgress>
}) {
  const shade = (best: number | undefined) => {
    if (best === undefined) return { cls: 'bg-line', label: 'not tried' }
    if (best < 40) return { cls: 'bg-ember', label: 'weak' }
    if (best < PASS_PERCENT) return { cls: 'bg-ember/50', label: 'nearly there' }
    if (best < 80) return { cls: 'bg-green/60', label: 'passed' }
    return { cls: 'bg-green', label: 'strong' }
  }
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Weak-topic map</h2>
          <p className="text-sm text-muted">
            Every unit, coloured by your best score. Tap one to open it.
          </p>
        </div>
        <span className="flex flex-wrap items-center gap-3 text-xs text-muted">
          {[
            ['bg-line', 'Not tried'],
            ['bg-ember', 'Weak'],
            ['bg-ember/50', `Below ${PASS_PERCENT}%`],
            ['bg-green/60', 'Passed'],
            ['bg-green', '80%+'],
          ].map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 border border-ink ${cls}`} aria-hidden="true" />
              {label}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center">
            <p className="truncate text-sm font-medium">{subject.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {subject.units.map((unit) => {
                const best = unitProgress[unit.id]?.best_percent
                const { cls, label } = shade(best)
                const text = `${unit.name}: ${best === undefined ? label : `${Math.round(best)}%, ${label}`}`
                return (
                  <Link
                    key={unit.id}
                    to={`/exam/unit/${unit.id}`}
                    title={text}
                    aria-label={text}
                    className={`h-9 w-9 border border-ink transition hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] ${cls}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Every paper that has fully unfolded is pinned here as a flat sheet.
// Until the first one, it shows the papers closest to unfolding.
function Achievements({
  subjects,
  mastery,
}: {
  subjects: SubjectWithUnits[]
  mastery: Record<string, UnitMastery>
}) {
  const papers = subjects.flatMap((subject) =>
    subject.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      subject: subject.name,
      mastery: mastery[unit.id]?.mastery ?? 0,
    })),
  )
  const earned = papers.filter((p) => p.mastery >= ACHIEVED_PERCENT)
  const closest = papers
    .filter((p) => p.mastery > 0 && p.mastery < ACHIEVED_PERCENT)
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 3)

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Achievements</h2>
          <p className="text-sm text-muted">
            A unit’s paper lands here once it is fully unfolded: every video watched and a perfect
            quiz.
          </p>
        </div>
        <span className="nums eyebrow">
          {earned.length}/{papers.length} papers
        </span>
      </div>

      {earned.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {earned.map((paper, i) => (
            <li key={paper.id}>
              <Link
                to={`/exam/unit/${paper.id}`}
                className="group block border border-ink bg-[#fbf9f3] p-4 text-[#14161a] shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5"
                style={{
                  rotate: `${[-2, 1.5, -1, 2, -1.5][i % 5]}deg`,
                  ['--color-ink' as string]: '#14161a', // paper stays dark-inked in Exam mode too
                }}
              >
                <span
                  aria-hidden="true"
                  className="mx-auto -mt-6 mb-2 block h-3 w-3 rounded-full border border-ink bg-ember"
                />
                <PaperIcon value={100} size={56} />
                <span className="mt-2 block text-sm leading-snug font-semibold">{paper.name}</span>
                <span className="mt-0.5 block truncate text-xs text-[#5d6068]">
                  {paper.subject}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-muted">
            No papers unfolded yet.{closest.length > 0 && ' Closest so far:'}
          </p>
          {closest.length > 0 && (
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {closest.map((paper) => (
                <li key={paper.id}>
                  <Link
                    to={`/exam/unit/${paper.id}`}
                    className="group row-link gap-3 border border-line px-4 py-3"
                  >
                    <PaperIcon value={paper.mastery} size={30} />
                    <span className="min-w-0 flex-1 truncate text-sm">{paper.name}</span>
                    <span className="nums text-sm text-muted group-hover:text-ink">
                      {paper.mastery}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function StatTile({
  label,
  value,
  note,
  dot,
}: {
  label: string
  value: string
  note: string
  dot: string
}) {
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
