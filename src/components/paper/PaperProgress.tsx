import { useEffect, useRef, useState } from 'react'
import PaperIcon from './PaperIcon'
import type { PaperHandle } from './paperScene'

type Props = {
  value: number // 0-100
  label: string // read out by screen readers, e.g. "Calculus mastery"
}

// Big 3D crushed paper that unfolds into a flat sheet as progress goes from 0 to 100.
// three.js is loaded only when this appears. Without WebGL, a 2D paper is shown instead.
export default function PaperProgress({ value, label }: Props) {
  const holder = useRef<HTMLDivElement>(null)
  const scene = useRef<PaperHandle | null>(null)
  const latest = useRef(value)
  const [webgl] = useState(hasWebGL)
  const [failed, setFailed] = useState(false)
  const shown = useCountUp(value)

  useEffect(() => {
    latest.current = value
    scene.current?.setProgress(value / 100)
  }, [value])

  useEffect(() => {
    if (!webgl || !holder.current) return
    const el = holder.current
    let cancelled = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    import('./paperScene')
      .then(({ createPaperScene }) => {
        if (cancelled) return
        scene.current = createPaperScene(el, { progress: latest.current / 100, reducedMotion })
      })
      .catch(() => setFailed(true))
    return () => {
      cancelled = true
      scene.current?.dispose()
      scene.current = null
    }
  }, [webgl])

  return (
    <div className="relative">
      <p
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="nums absolute top-0 right-0 z-10 text-sm text-muted"
      >
        {shown}%
      </p>
      {webgl && !failed ? (
        <div ref={holder} className="h-64 w-full sm:h-80" />
      ) : (
        <div className="grid h-64 place-items-center sm:h-80">
          <PaperIcon value={value} size={180} />
        </div>
      )}
      {webgl && !failed && (
        <p className="pointer-events-none absolute bottom-0 left-0 text-xs text-muted">
          Drag to turn
        </p>
      )}
    </div>
  )
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// Counts the number up smoothly when it changes (instant for reduced motion).
function useCountUp(target: number): number {
  const [shown, setShown] = useState(0)
  const current = useRef(0)
  useEffect(() => {
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = current.current
    const start = performance.now()
    let frame = 0
    function step(now: number) {
      const t = instant ? 1 : Math.min(1, (now - start) / 900)
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)))
      current.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return shown
}
