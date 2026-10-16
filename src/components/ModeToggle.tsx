import { useRef, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import type { Mode } from '../types/database'

type Props = {
  mode: Mode
  onChange: (mode: Mode) => void
}

// The Default / Exam switch. Default lights up ember, Exam lights up green.
// Switching plays a circular reveal that grows out of this toggle (View Transitions API).
export default function ModeToggle({ mode, onChange }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const isExam = mode === 'exam'
  const other: Mode = isExam ? 'default' : 'exam'

  function swap(target: Mode) {
    if (target === mode) return
    const el = ref.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || reduceMotion || !('startViewTransition' in document)) {
      onChange(target) // older browsers or reduced motion: switch straight away
      return
    }

    // The circle starts at the toggle's centre and grows until it covers the whole screen.
    const box = el.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(() => {
      document.documentElement.dataset.mode = target // flip the theme inside the snapshot
      flushSync(() => onChange(target))
    })
    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 650,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  // Arrow keys work too: left = Default, right = Exam.
  function handleKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') swap('default')
    if (e.key === 'ArrowRight') swap('exam')
  }

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isExam}
      aria-label="Exam mode"
      onClick={() => swap(other)}
      onKeyDown={handleKey}
      className={`group relative inline-grid h-10 w-44 cursor-pointer grid-cols-2 items-center rounded-full border border-ink p-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink ${
        isExam ? 'bg-surface hover:bg-ember-soft' : 'bg-surface hover:bg-green-soft'
      }`}
    >
      {/* The sliding thumb: stretches toward the other side on hover, squashes when pressed */}
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full border border-ink transition-[translate,scale,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-x-[1.08] group-active:scale-95 ${
          isExam ? 'origin-right translate-x-full bg-green' : 'origin-left bg-ember'
        }`}
      />
      <span className={`relative text-center ${isExam ? 'text-muted' : 'text-on-accent'}`}>
        Default
      </span>
      <span className={`relative text-center ${isExam ? 'text-on-accent' : 'text-muted'}`}>
        Exam
      </span>

      {/* Tooltip (mouse hover or keyboard focus) */}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-sm border border-ink bg-surface px-2 py-1 text-xs whitespace-nowrap text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Switch to {isExam ? 'Default' : 'Exam'} mode
      </span>
    </button>
  )
}
