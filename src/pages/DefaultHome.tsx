import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { localDay } from '../lib/dates'
import { greeting } from '../lib/greeting'
import { liveStreak } from '../lib/streak'
import { getTodaysBooks } from '../services/aiService'
import { completeChallenge, getTodaysChallenges } from '../services/challengeService'
import { errorMessage } from '../services/functionsClient'
import type { DailyBook } from '../types/database'

// Default Mode: streak, today's two Comfort Zone tasks and today's two books.
export default function DefaultHome() {
  const { displayName, profile, setProfile } = useShell()
  const today = localDay()

  const tasks = useLoad(() => getTodaysChallenges(today), today)
  const books = useLoad(() => getTodaysBooks(today), today)
  const [saving, setSaving] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const streak = profile ? liveStreak(profile.current_streak, profile.last_streak_date, today) : 0
  const doneCount = tasks.data?.doneIds.length ?? 0
  const dayComplete = doneCount >= 2

  async function markDone(challengeId: number) {
    if (!tasks.data) return
    setSaving(challengeId)
    setSaveError(null)
    try {
      const updated = await completeChallenge(challengeId, today)
      setProfile(updated)
      tasks.setData({ ...tasks.data, doneIds: [...tasks.data.doneIds, challengeId] })
    } catch (error) {
      setSaveError(errorMessage(error))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Default mode · Today" title={`${greeting()}, ${displayName}`} />

      {/* Streak */}
      <section className="panel p-6 sm:p-8">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-ember/30 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <StreakRing value={streak} doneToday={doneCount} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-white/50!">Consistency streak</p>
            <p className="mt-1 font-display text-2xl">
              {streak === 0 ? 'Start today' : `${streak} day${streak === 1 ? '' : 's'} in a row`}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {dayComplete
                ? 'Both tasks done. Today counts.'
                : `Finish both tasks to count today · ${doneCount}/2 done`}
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow text-white/50!">Best</p>
            <p className="nums mt-1 font-display text-2xl">{profile?.best_streak ?? 0}</p>
          </div>
        </div>
      </section>

      {/* Comfort Zone tasks */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Comfort Zone</h2>
          <span className="eyebrow">2 small tasks</span>
        </div>
        {tasks.loading && <Loading />}
        {tasks.error && <ErrorNote message={tasks.error} onRetry={tasks.reload} />}
        {saveError && <ErrorNote message={saveError} />}
        {tasks.data && tasks.data.challenges.length === 0 && (
          <EmptyState title="No tasks yet" text="The task list is empty. Check back later." />
        )}
        {tasks.data && (
          <div className="grid gap-3 md:grid-cols-2">
            {tasks.data.challenges.map((challenge, index) => {
              const done = tasks.data!.doneIds.includes(challenge.id)
              return (
                <article
                  key={challenge.id}
                  className={`card flex flex-col gap-4 p-5 transition ${done ? 'border-ember/40 bg-ember-soft/60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Task {String(index + 1).padStart(2, '0')}</span>
                    {done && <span className="text-xs font-semibold text-ember">Done ✓</span>}
                  </div>
                  <p className="flex-1 leading-relaxed">{challenge.text}</p>
                  {!done && (
                    <button
                      type="button"
                      className="btn-ember self-start py-2! text-sm"
                      disabled={saving !== null}
                      onClick={() => void markDone(challenge.id)}
                    >
                      {saving === challenge.id ? 'Saving…' : 'Mark as done'}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Books */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Today’s reads</h2>
          <span className="eyebrow">New picks each day</span>
        </div>
        {books.loading && <Loading label="Picking today’s books" />}
        {books.errorCode === 'NO_KEY' ? (
          <EmptyState
            title="Add your Gemini key to get book picks"
            text="Book picks are made with your own free Gemini key. It takes a minute to set up."
            action={
              <Link to="/settings" className="btn-ember py-2! text-sm">
                Go to Settings
              </Link>
            }
          />
        ) : (
          books.error && <ErrorNote message={books.error} onRetry={books.reload} />
        )}
        {books.data && (
          <div className="grid gap-3 md:grid-cols-2">
            {sortBooks(books.data).map((book) => (
              <BookCard key={book.kind} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function sortBooks(books: DailyBook[]): DailyBook[] {
  // fiction first, then non-fiction
  return [...books].sort((a, b) => Number(a.kind !== 'fiction') - Number(b.kind !== 'fiction'))
}

function BookCard({ book }: { book: DailyBook }) {
  return (
    <article className="card flex gap-4 p-5">
      <div
        aria-hidden="true"
        className="grid h-24 w-16 shrink-0 place-items-center rounded-lg bg-ink font-display text-2xl text-white"
      >
        {book.title.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="eyebrow">{book.kind === 'fiction' ? 'Fiction' : 'Non-fiction'}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold">{book.title}</h3>
        <p className="text-sm text-muted">{book.author}</p>
        <p className="mt-2 text-sm leading-relaxed">{book.reason}</p>
      </div>
    </article>
  )
}

// Circle that fills halfway per task done today.
function StreakRing({ value, doneToday }: { value: number; doneToday: number }) {
  const circumference = 2 * Math.PI * 28
  const filled = Math.min(doneToday, 2) / 2
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="#E08A3C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="nums font-display text-3xl">{value}</span>
    </div>
  )
}
