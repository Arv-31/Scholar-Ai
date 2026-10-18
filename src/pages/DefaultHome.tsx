import { useState } from 'react'
import { Link } from 'react-router-dom'
import BookCover from '../components/BookCover'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import Tally from '../components/Tally'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { localDay } from '../lib/dates'
import { greeting } from '../lib/greeting'
import { makeStreakCard, shareOrDownload } from '../lib/streakCard'
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

      {/* Streak: tally marks, one stroke per day; a day counts when both tasks are done */}
      <Reveal index={0}>
        <section className="panel p-6 sm:p-8">
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
          <div className="relative grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-end">
            <p className="nums font-display text-7xl leading-none text-ember">{streak}</p>
            <div className="min-w-0">
              <p className="eyebrow text-white/50!">Consistency streak</p>
              <p className="mt-1 font-display text-2xl">
                {streak === 0 ? 'Start today' : `${streak} day${streak === 1 ? '' : 's'} in a row`}
              </p>
              <Tally count={streak} className="mt-3 text-[#edebe3]" />
            </div>
            <div className="sm:text-right">
              <p className="eyebrow text-white/50!">Today · best</p>
              <p className="nums mt-1 text-lg">
                {doneCount}/2 · {profile?.best_streak ?? 0}
              </p>
              <button
                type="button"
                className="mt-3 cursor-pointer border border-[#edebe3]/40 px-3 py-1.5 text-xs text-[#edebe3] transition hover:border-[#edebe3]"
                onClick={() =>
                  void makeStreakCard(streak, profile?.best_streak ?? 0, displayName).then((blob) =>
                    shareOrDownload(blob, `scholarai-streak-${streak}.png`),
                  )
                }
              >
                Share streak card
              </button>
            </div>
          </div>
          <p className="relative mt-5 text-sm text-white/60">
            {dayComplete
              ? 'Both tasks done. Today counts.'
              : 'Finish both Comfort Zone tasks to count today.'}
          </p>
        </section>
      </Reveal>

      {/* Comfort Zone tasks */}
      <Reveal index={1}>
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
            <div className="grid gap-4 md:grid-cols-[1.25fr_1fr]">
              {tasks.data.challenges.map((challenge, index) => {
                const done = tasks.data!.doneIds.includes(challenge.id)
                return (
                  <article
                    key={challenge.id}
                    className={`card flex flex-col gap-4 p-5 ${done ? 'bg-ember-soft' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="eyebrow">Task {String(index + 1).padStart(2, '0')}</span>
                      {done && (
                        <span className="nums border border-ink bg-ember px-2 py-0.5 text-xs font-semibold text-on-accent">
                          Done
                        </span>
                      )}
                    </div>
                    <p
                      className={`flex-1 leading-relaxed ${done ? 'text-muted line-through decoration-ember decoration-2' : ''}`}
                    >
                      {challenge.text}
                    </p>
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
      </Reveal>

      {/* Books */}
      <Reveal index={2}>
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
            <div className="grid gap-4 md:grid-cols-[1fr_1.25fr]">
              {sortBooks(books.data).map((book) => (
                <BookCard key={book.kind} book={book} />
              ))}
            </div>
          )}
        </section>
      </Reveal>
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
      <BookCover title={book.title} author={book.author} kind={book.kind} />
      <div className="min-w-0">
        <p className="eyebrow">{book.kind === 'fiction' ? 'Fiction' : 'Non-fiction'}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold">{book.title}</h3>
        <p className="text-sm text-muted">{book.author}</p>
        <p className="mt-2 text-sm leading-relaxed">{book.reason}</p>
      </div>
    </article>
  )
}
