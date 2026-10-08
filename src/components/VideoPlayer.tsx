import { useEffect, useRef } from 'react'
import { loadYouTubeApi, type YTPlayer } from '../lib/youtube'

type Props = {
  youtubeId: string
  startPercent: number // what the student already watched
  onProgress: (percent: number) => void // called when they get further (in 5% steps)
}

// Plays a YouTube video inside our app and reports how far the student got (watch %).
export default function VideoPlayer({ youtubeId, startPercent, onProgress }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onProgressRef = useRef(onProgress)
  const bestRef = useRef(startPercent)

  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  useEffect(() => {
    let player: YTPlayer | null = null
    let timer: number | undefined
    let cancelled = false
    const host = hostRef.current

    function check(ended = false) {
      if (!player) return
      const duration = player.getDuration()
      if (!duration) return
      const percent = ended ? 100 : Math.min(100, (player.getCurrentTime() / duration) * 100)
      // Report only real progress, in 5% steps, so we don't write to the DB every second.
      if (percent >= bestRef.current + 5 || (percent === 100 && bestRef.current < 100)) {
        bestRef.current = Math.round(percent)
        onProgressRef.current(bestRef.current)
      }
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled || !host) return
      // YouTube replaces the element it is given, so we give it a child React does not manage.
      const target = document.createElement('div')
      host.appendChild(target)
      player = new YT.Player(target, {
        videoId: youtubeId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) check(true)
            if (event.data === YT.PlayerState.PAUSED) check()
          },
        },
      })
      timer = window.setInterval(() => check(), 4000)
    })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      player?.destroy()
      if (host) host.innerHTML = ''
    }
  }, [youtubeId])

  return (
    <div
      ref={hostRef}
      className="aspect-video w-full overflow-hidden rounded-2xl bg-ink [&_iframe]:h-full [&_iframe]:w-full"
    />
  )
}
