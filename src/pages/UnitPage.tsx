import { useCallback, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PaperIcon from '../components/paper/PaperIcon'
import PaperProgress from '../components/paper/PaperProgress'
import ProgressBar from '../components/ProgressBar'
import Reveal from '../components/Reveal'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import Tally from '../components/Tally'
import VideoPlayer from '../components/VideoPlayer'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { localDay } from '../lib/dates'
import { buildMastery, type MasteryData, type VideoRow } from '../lib/mastery'
import { PASS_PERCENT, ROUNDS } from '../lib/quiz'
import { liveStreak } from '../lib/streak'
import { getMyUnitProgress, getSubjectUnits, getUnit } from '../services/examService'
import { getMasteryData } from '../services/masteryService'
import {
  getMyRoundBests,
  getRoundSizes,
  getWeakSpots,
  type WeakSpot,
} from '../services/quizService'
import { getMyWatch, getUnitVideos, saveWatch } from '../services/videoService'
import type { UnitProgress, UnitVideo } from '../types/database'

type Videos = { list: UnitVideo[]; watch: Record<string, number> }
// { subtopicId: { round: value } } for question counts and best scores
type PerRound = Record<string, Record<number, number>>

// One unit (topic). The paper frame is the hero; below it are the subtopics (notes + 10 rounds
// each), videos, Ask AI, weak spots and the next unit. Every block is a bordered "worksheet" card.
export default function UnitPage() {
  const { unitId = '' } = useParams()
  const { profile } = useShell()

  const page = useLoad(async () => {
    const [unit, progress, masteryData, sizes, bests] = await Promise.all([
      getUnit(unitId),
      getMyUnitProgress(),
      getMasteryData([unitId]),
      getRoundSizes(unitId),
      getMyRoundBests(unitId),
    ])
    const siblings = unit ? await getSubjectUnits(unit.subject_id) : []
    return { unit, progress: progress[unitId], siblings, masteryData, sizes, bests }
  }, unitId)

  // Videos load on their own: if YouTube is not set up, the rest of the page still works.
  const videos = useLoad(async (): Promise<Videos> => {
    const list = await getUnitVideos(unitId)
    const watch = await getMyWatch(list.map((v) => v.id))
    return { list, watch }
  }, unitId)

  if (page.loading) return <Loading />
  if (page.error) return <ErrorNote message={page.error} onRetry={page.reload} />
  if (!page.data?.unit) {
    return (
      <EmptyState title="Unit not found" text="It may have been removed." action={<BackLink />} />
    )
  }

  const { unit, progress, siblings, masteryData, sizes, bests } = page.data
  const live = liveMastery(unitId, masteryData, videos.data)
  const passed = (subtopicId: string) =>
    Object.values(bests[subtopicId] ?? {}).some((p) => p >= PASS_PERCENT)
  const completeCount = live.subtopics.filter((s) => passed(s.id)).length
  const mastery = live.mastery
  const streak = profile
    ? liveStreak(profile.current_streak, profile.last_streak_date, localDay())
    : 0

  const index = siblings.findIndex((u) => u.id === unit.id)
  const prev = index > 0 ? siblings[index - 1] : null
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null

  // The frame lists the unit's subtopics, each with its own paper. Units without subtopics
  // show the videos + best quiz breakdown instead.
  const rows: { name: string; value: number | null; empty: string }[] = live.subtopics.length
    ? live.subtopics.map((s) => ({ name: s.name, value: s.mastery, empty: '' }))
    : [
        {
          name: 'Videos watched',
          value: live.videoAvg,
          empty: videos.loading ? '…' : 'No videos yet',
        },
        { name: 'Best quiz', value: live.bestQuiz, empty: 'Not tried' },
      ]
  const subtopicName = (spot: { question: string; subtopicId: string | null }) => {
    const id =
      spot.subtopicId ??
      masteryData.questions.find((q) => q.question === spot.question)?.subtopic_id ??
      null
    return live.subtopics.find((s) => s.id === id)?.name ?? null
  }

  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <BackLink />
        <span aria-hidden="true">/</span>
        <span>{unit.subject.name}</span>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{unit.name}</span>
      </nav>

      {/* Hero: paper frame + side column */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <Reveal index={0}>
          <section className="card p-5 sm:p-7">
            <PaperProgress value={mastery} label={`${unit.name} mastery`} />
            <div className="mt-4 border-t border-ink pt-5">
              <p className="eyebrow">
                {unit.exam.code} · {unit.subject.name}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                {unit.name}
              </h1>
              <ul className="mt-5 space-y-2.5">
                {rows.map((row) => (
                  <li key={row.name} className="flex items-center gap-3 text-sm">
                    <PaperIcon value={row.value ?? 0} size={22} />
                    <span>{row.name}</span>
                    <span
                      aria-hidden="true"
                      className="mb-1 flex-1 border-b border-dotted border-ink/40"
                    />
                    <span className={`nums ${row.value === null ? 'text-muted' : ''}`}>
                      {row.value === null ? row.empty : `${Math.round(row.value)}%`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-muted">
                {live.subtopics.length
                  ? 'Each subtopic has its own paper: half from its videos, half from your best score on its questions. The big paper is their average.'
                  : 'The paper unfolds as you learn: half from videos watched, half from your best quiz score.'}{' '}
                A subtopic is complete when you score {PASS_PERCENT}% or more in any of its{' '}
                {ROUNDS} rounds; the unit is complete when every subtopic is.
              </p>
            </div>
          </section>
        </Reveal>

        <aside className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Reveal index={1}>
            <StatusCard
              progress={progress}
              complete={completeCount}
              total={live.subtopics.length}
            />
          </Reveal>
          <Reveal index={2}>
            <NextUpCard
              subtopics={live.subtopics}
              sizes={sizes}
              bests={bests}
              videos={videos.data}
            />
          </Reveal>
          <Reveal index={3}>
            <section className="panel p-5">
              <p className="eyebrow text-white/50!">Streak</p>
              <Tally count={streak} max={15} className="mt-3 text-ember" />
              <p className="nums mt-2 text-sm text-white/70">
                {streak} day{streak === 1 ? '' : 's'}
              </p>
            </section>
          </Reveal>
        </aside>
      </div>

      {live.subtopics.length > 0 && (
        <Reveal index={4}>
          <SubtopicsBlock subtopics={live.subtopics} sizes={sizes} bests={bests} />
        </Reveal>
      )}

      <Reveal index={4}>
        <VideosBlock
          videos={videos}
          onWatch={(videoId, percent) => {
            if (!videos.data) return
            void saveWatch(videoId, percent)
            videos.setData({ ...videos.data, watch: { ...videos.data.watch, [videoId]: percent } })
          }}
        />
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal index={6}>
          <AskBox unitId={unit.id} unitName={unit.name} />
        </Reveal>
        <Reveal index={7}>
          <WeakSpots unitId={unit.id} subtopicName={subtopicName} />
        </Reveal>
      </div>

      {(prev || next) && (
        <Reveal index={8}>
          <nav aria-label="More units" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link to={`/exam/unit/${prev.id}`} className="card block p-5">
                <p className="eyebrow">← Previous unit</p>
                <p className="mt-1 font-display text-lg">{prev.name}</p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/exam/unit/${next.id}`} className="card block p-5 text-right">
                <p className="eyebrow">Next unit →</p>
                <p className="mt-1 font-display text-lg">{next.name}</p>
              </Link>
            )}
          </nav>
        </Reveal>
      )}
    </div>
  )
}

// Mastery for this unit, using the watch % from this page so the paper reacts while you watch.
function liveMastery(unitId: string, data: MasteryData, videos: Videos | null) {
  const videoRows: VideoRow[] = videos
    ? videos.list.map((v) => ({
        id: v.id,
        unit_id: v.unit_id,
        title: v.title,
        subtopic_id: data.videos.find((m) => m.id === v.id)?.subtopic_id ?? null,
      }))
    : data.videos
  const result = buildMastery({
    ...data,
    videos: videoRows,
    watch: { ...data.watch, ...(videos?.watch ?? {}) },
  })
  return result[unitId] ?? { mastery: 0, videoAvg: null, bestQuiz: null, subtopics: [] }
}

function BackLink() {
  return (
    <Link to="/exam" className="transition hover:text-ink">
      ← All subjects
    </Link>
  )
}

function StatusCard({
  progress,
  complete,
  total,
}: {
  progress?: UnitProgress
  complete: number
  total: number
}) {
  const done = total > 0 && complete === total
  const status = done ? 'Complete' : progress || complete > 0 ? 'In progress' : 'Not started'
  const dot = done ? 'bg-green' : progress || complete > 0 ? 'bg-ember' : 'bg-line'
  return (
    <section className="card p-5">
      <p className="eyebrow">Status</p>
      <p className="mt-2 flex items-center gap-2 font-display text-xl">
        <span className={`h-2.5 w-2.5 rounded-full border border-ink ${dot}`} aria-hidden="true" />
        {status}
      </p>
      <p className="nums mt-2 text-sm text-muted">
        {total > 0
          ? `${complete} of ${total} subtopics complete`
          : `Pass mark ${PASS_PERCENT}%`}
      </p>
    </section>
  )
}

// One clear suggestion for what to do next on this unit: the first subtopic not yet complete,
// at its first round not yet tried (or its best round to retry), after any unwatched video.
function NextUpCard({
  subtopics,
  sizes,
  bests,
  videos,
}: {
  subtopics: { id: string; name: string }[]
  sizes: PerRound
  bests: PerRound
  videos: Videos | null
}) {
  const unwatched = videos?.list.find((v) => (videos.watch[v.id] ?? 0) < 80)
  const open = subtopics.find(
    (s) => !Object.values(bests[s.id] ?? {}).some((p) => p >= PASS_PERCENT),
  )
  let text = 'Everything is complete. Revise from your Mistakes page.'
  let to = '/exam/mistakes'
  if (open) {
    const rounds = Object.keys(sizes[open.id] ?? {}).map(Number)
    const fresh = rounds.sort((a, b) => a - b).find((r) => !(r in (bests[open.id] ?? {})))
    const round = fresh ?? rounds[0] ?? 1
    text = `${open.name} · ${fresh ? 'Start' : 'Retry'} round ${round}`
    to = `/exam/subtopic/${open.id}/round/${round}`
    if (unwatched && !bests[open.id]) {
      text = `Watch: ${unwatched.title}`
      to = '#videos'
    }
  }

  return (
    <section className="card p-5">
      <p className="eyebrow">Next up</p>
      {to.startsWith('#') ? (
        <a
          href={to}
          className="mt-2 line-clamp-2 block font-medium underline decoration-green decoration-2 underline-offset-4"
        >
          {text}
        </a>
      ) : (
        <Link
          to={to}
          className="mt-2 block font-medium underline decoration-green decoration-2 underline-offset-4"
        >
          {text}
        </Link>
      )}
    </section>
  )
}

function VideosBlock({
  videos,
  onWatch,
}: {
  videos: ReturnType<typeof useLoad<Videos>>
  onWatch: (videoId: string, percent: number) => void
}) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { data } = videos
  const current = data?.list.find((v) => v.id === playingId) ?? data?.list[0] ?? null

  const handleProgress = useCallback(
    (percent: number) => {
      if (current) onWatch(current.id, percent)
    },
    [current, onWatch],
  )

  return (
    <section id="videos" className="scroll-mt-24">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Videos</h2>
        <span className="eyebrow">Watch % is saved</span>
      </div>

      {videos.loading && <Loading label="Finding videos" />}
      {videos.errorCode === 'NO_YOUTUBE_KEY' ? (
        <EmptyState
          title="Videos are being set up"
          text="Video lessons for this unit will appear here soon."
        />
      ) : (
        videos.error && <ErrorNote message={videos.error} onRetry={videos.reload} />
      )}
      {data && data.list.length === 0 && (
        <EmptyState title="No videos yet" text="We couldn’t find videos for this unit." />
      )}

      {data && current && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="card overflow-hidden">
            {playingId ? (
              <VideoPlayer
                key={current.id}
                youtubeId={current.youtube_video_id}
                startPercent={data.watch[current.id] ?? 0}
                onProgress={handleProgress}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(current.id)}
                className="group relative block aspect-video w-full cursor-pointer bg-board"
                aria-label={`Play ${current.title}`}
              >
                {current.thumbnail_url && (
                  <img
                    src={current.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-ink bg-ember text-2xl text-on-accent shadow-[3px_3px_0_#14161a] transition group-hover:scale-105">
                    ▶
                  </span>
                </span>
              </button>
            )}
            <div className="border-t border-ink p-4">
              <p className="font-medium">{current.title}</p>
              <p className="text-xs text-muted">{current.channel_title}</p>
              {/* watch-then-check: once 80% is watched, offer a 3-question practice check */}
              {(data.watch[current.id] ?? 0) >= 80 && (
                <Link
                  to={`/exam/unit/${current.unit_id}/check`}
                  className="btn-primary mt-3 py-2! text-sm"
                >
                  Quick check · 3 questions
                </Link>
              )}
            </div>
          </div>

          <ul className="card divide-y divide-line self-start overflow-hidden">
            {data.list.map((video) => {
              const watched = data.watch[video.id] ?? 0
              const active = video.id === current.id
              return (
                <li key={video.id}>
                  <button
                    type="button"
                    onClick={() => setPlayingId(video.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`group row-link w-full cursor-pointer gap-3 p-3 text-left ${active ? 'bg-paper' : ''}`}
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="aspect-video w-24 shrink-0 border border-ink object-cover"
                      />
                    ) : (
                      <span className="aspect-video w-24 shrink-0 border border-ink bg-board" />
                    )}
                    <span className="min-w-0 flex-1 space-y-1.5">
                      <span className="line-clamp-2 block text-sm leading-snug font-medium">
                        {video.title}
                      </span>
                      <span className="flex items-center gap-2">
                        <ProgressBar value={watched} tone="ember" label={`Watched ${watched}%`} />
                        <span className="nums w-9 text-right text-xs text-muted group-hover:text-ink">
                          {watched}%
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

// Compact "ask about this topic": opens the tutor with the question already typed.
function AskBox({ unitId, unitName }: { unitId: string; unitName: string }) {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = question.trim() || `Explain ${unitName} in simple words`
    navigate(`/exam/chat?unit=${unitId}&q=${encodeURIComponent(q)}`)
  }

  return (
    <section className="card h-full p-5">
      <p className="eyebrow">Ask AI about this topic</p>
      <h2 className="mt-1 text-xl font-semibold">Stuck on something?</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor="ask-unit" className="sr-only">
          Your question
        </label>
        <input
          id="ask-unit"
          className="field"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`e.g. a shortcut for ${unitName}`}
        />
        <button type="submit" className="btn-primary shrink-0 py-2! text-sm">
          Ask
        </button>
      </form>
    </section>
  )
}

function WeakSpots({
  unitId,
  subtopicName,
}: {
  unitId: string
  subtopicName: (spot: WeakSpot) => string | null
}) {
  const spots = useLoad(() => getWeakSpots(unitId), unitId)
  return (
    <section className="card h-full p-5">
      <p className="eyebrow">Weak spots</p>
      <h2 className="mt-1 text-xl font-semibold">From your quiz mistakes</h2>
      {spots.loading && <p className="mt-4 text-sm text-muted">Loading…</p>}
      {spots.error && <p className="mt-4 text-sm text-danger">{spots.error}</p>}
      {spots.data && spots.data.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          Nothing yet. Questions you miss in any round show up here and on your Mistakes page.
        </p>
      )}
      {spots.data && spots.data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {spots.data.map((spot) => (
            <li key={spot.question} className="border-l-4 border-ember pl-3 text-sm">
              {subtopicName(spot) && <p className="eyebrow mb-0.5">{subtopicName(spot)}</p>}
              <p>{spot.question}</p>
              <p className="mt-0.5 text-muted">
                Answer: <span className="text-ink">{spot.answer}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Each subtopic: notes first, then 10 rounds of 5 questions. A round shows its best score;
// passing any one round (60%+) completes the subtopic.
function SubtopicsBlock({
  subtopics,
  sizes,
  bests,
}: {
  subtopics: { id: string; name: string; mastery: number }[]
  sizes: PerRound
  bests: PerRound
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold">Subtopics</h2>
        <span className="eyebrow">Read the notes · then practise the rounds</span>
      </div>
      <ul className="space-y-4">
        {subtopics.map((s, i) => {
          const best = bests[s.id] ?? {}
          const top = Math.max(-1, ...Object.values(best))
          const done = top >= PASS_PERCENT
          return (
            <li key={s.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="nums w-6 text-sm text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <PaperIcon value={s.mastery} size={22} />
                <h3 className="min-w-0 flex-1 font-sans text-base font-semibold">{s.name}</h3>
                <span
                  className={`nums border border-ink px-2 py-0.5 text-xs font-semibold ${
                    done ? 'bg-green text-on-accent' : top >= 0 ? 'bg-ember-soft' : 'bg-surface'
                  }`}
                >
                  {done ? '✓ Complete' : top >= 0 ? `Best ${Math.round(top)}%` : 'Not started'}
                </span>
                <Link to={`/exam/notes/${s.id}`} className="btn-ghost py-1.5! text-xs!">
                  Notes
                </Link>
              </div>
              <ol className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Rounds">
                {Array.from({ length: ROUNDS }, (_, r) => r + 1).map((round) => {
                  const ready = (sizes[s.id]?.[round] ?? 0) > 0
                  const score = best[round]
                  const label =
                    score === undefined ? `Round ${round}` : `Round ${round}, best ${score}%`
                  const look =
                    score === undefined
                      ? 'border-line'
                      : score >= PASS_PERCENT
                        ? 'border-ink bg-green text-on-accent'
                        : 'border-ink bg-ember-soft'
                  return (
                    <li key={round}>
                      {ready ? (
                        <Link
                          to={`/exam/subtopic/${s.id}/round/${round}`}
                          aria-label={label}
                          title={label}
                          className={`nums flex h-12 flex-col items-center justify-center border text-xs transition hover:-translate-y-0.5 hover:border-ink ${look}`}
                        >
                          <span className="font-semibold">{round}</span>
                          {score !== undefined && (
                            <span className="text-[10px]">{Math.round(score)}%</span>
                          )}
                        </Link>
                      ) : (
                        <span
                          title="Coming soon"
                          className="nums flex h-12 items-center justify-center border border-dashed border-line text-xs text-muted"
                        >
                          {round}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
