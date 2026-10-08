import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { EmptyState, ErrorNote, Loading } from '../components/StateNote'
import VideoPlayer from '../components/VideoPlayer'
import { useLoad } from '../hooks/useLoad'
import { shortDate } from '../lib/dates'
import { PASS_PERCENT } from '../lib/quiz'
import { getMyUnitProgress, getUnit } from '../services/examService'
import { listMyAttempts } from '../services/quizService'
import { getMyWatch, getUnitVideos, saveWatch } from '../services/videoService'
import type { Round, UnitVideo } from '../types/database'

const ROUNDS: { round: Round; title: string; text: string }[] = [
  { round: 1, title: 'Round 1', text: '5 set questions on the basics.' },
  { round: 2, title: 'Round 2', text: '5 set questions, a step harder.' },
  { round: 3, title: 'Round 3 · AI', text: '5 fresh questions on what you got wrong. Uses your Gemini key.' },
]

// One unit: completion status, the three quiz rounds, videos, and a shortcut to the tutor.
export default function UnitPage() {
  const { unitId = '' } = useParams()

  const page = useLoad(
    async () => {
      const [unit, progress, attempts] = await Promise.all([
        getUnit(unitId),
        getMyUnitProgress(),
        listMyAttempts({ unitId }),
      ])
      return { unit, progress: progress[unitId], attempts }
    },
    unitId,
  )

  if (page.loading) return <Loading />
  if (page.error) return <ErrorNote message={page.error} onRetry={page.reload} />
  if (!page.data?.unit) {
    return <EmptyState title="Unit not found" text="It may have been removed." action={<BackLink />} />
  }

  const { unit, progress, attempts } = page.data

  return (
    <div className="space-y-8">
      <BackLink />
      <PageHeader
        eyebrow={`${unit.exam.code} · ${unit.subject.name}`}
        title={unit.name}
        action={
          <Link to={`/exam/chat?unit=${unit.id}`} className="btn-ghost">
            Ask AI about this unit
          </Link>
        }
      />

      {/* Status */}
      <section className="panel p-6 sm:p-8">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
        <div className="relative grid gap-6 sm:grid-cols-3">
          <div>
            <p className="eyebrow text-white/50!">Status</p>
            <p className="mt-2 flex items-center gap-2 font-display text-2xl">
              <span
                className={`h-2.5 w-2.5 rounded-full ${progress?.completed ? 'bg-green' : progress ? 'bg-ember' : 'bg-white/30'}`}
              />
              {progress?.completed ? 'Complete' : progress ? 'In progress' : 'Not started'}
            </p>
          </div>
          <div>
            <p className="eyebrow text-white/50!">Last score</p>
            <p className="nums mt-2 font-display text-2xl">
              {progress
                ? `${progress.last_score}/${progress.last_total} · ${Math.round(progress.last_percent)}%`
                : '—'}
            </p>
          </div>
          <div>
            <p className="eyebrow text-white/50!">Best</p>
            <p className="nums mt-2 font-display text-2xl">
              {progress ? `${Math.round(progress.best_percent)}%` : '—'}
            </p>
          </div>
        </div>
        <p className="relative mt-6 text-sm text-white/60">
          Score {PASS_PERCENT}% or more in any round to complete this unit.
        </p>
      </section>

      {/* Quiz rounds */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">Quiz rounds</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {ROUNDS.map(({ round, title, text }) => {
            const last = attempts.find((a) => a.round === round)
            return (
              <article key={round} className="card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-base font-semibold">{title}</h3>
                  {last && (
                    <span
                      className={`nums rounded-full px-2 py-0.5 text-xs font-semibold ${
                        last.percent >= PASS_PERCENT ? 'bg-green-soft text-green' : 'bg-ember-soft text-ember'
                      }`}
                    >
                      {Math.round(last.percent)}%
                    </span>
                  )}
                </div>
                <p className="flex-1 text-sm text-muted">{text}</p>
                {last && (
                  <p className="nums text-xs text-muted">
                    Last: {last.score}/{last.total} on {shortDate(last.created_at)}
                  </p>
                )}
                <Link
                  to={`/exam/unit/${unit.id}/quiz/${round}`}
                  className="btn-primary py-2! text-sm"
                >
                  {last ? 'Try again' : 'Start'}
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      <Videos unitId={unit.id} />
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/exam" className="text-sm text-muted transition hover:text-ink">
      ← All subjects
    </Link>
  )
}

function Videos({ unitId }: { unitId: string }) {
  const videos = useLoad(async () => {
    const list = await getUnitVideos(unitId)
    const watch = await getMyWatch(list.map((v) => v.id))
    return { list, watch }
  }, unitId)
  const [playing, setPlaying] = useState<UnitVideo | null>(null)
  const { data, setData } = videos

  const handleProgress = useCallback(
    (percent: number) => {
      if (!playing || !data) return
      void saveWatch(playing.id, percent)
      setData({ ...data, watch: { ...data.watch, [playing.id]: percent } })
    },
    [playing, data, setData],
  )

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Videos</h2>
        <span className="eyebrow">Watch % is saved</span>
      </div>

      {videos.loading && <Loading label="Finding videos" />}
      {videos.error && <ErrorNote message={videos.error} onRetry={videos.reload} />}
      {data && data.list.length === 0 && (
        <EmptyState title="No videos yet" text="We couldn’t find videos for this unit." />
      )}

      {playing && data && (
        <div className="mb-4 space-y-3">
          <VideoPlayer
            key={playing.id}
            youtubeId={playing.youtube_video_id}
            startPercent={data.watch[playing.id] ?? 0}
            onProgress={handleProgress}
          />
          <div className="flex items-center justify-between gap-4">
            <p className="min-w-0 truncate font-medium">{playing.title}</p>
            <button type="button" className="btn-ghost shrink-0" onClick={() => setPlaying(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {data && data.list.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.list.map((video) => {
            const watched = data.watch[video.id] ?? 0
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setPlaying(video)}
                className={`card cursor-pointer overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgb(18_21_27/0.5)] ${
                  playing?.id === video.id ? 'border-green' : ''
                }`}
              >
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                ) : (
                  <div className="aspect-video w-full bg-ink" />
                )}
                <div className="space-y-2 p-4">
                  <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
                  <p className="truncate text-xs text-muted">{video.channel_title}</p>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={watched} label={`Watched ${watched}%`} />
                    <span className="nums w-9 text-right text-xs text-muted">{watched}%</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
