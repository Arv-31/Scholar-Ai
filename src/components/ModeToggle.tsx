import type { Mode } from '../types/database'

type Props = {
  mode: Mode
  onChange: (mode: Mode) => void
}

const MODES: { value: Mode; label: string; activeClass: string }[] = [
  { value: 'default', label: 'Default', activeClass: 'bg-ember' },
  { value: 'exam', label: 'Exam', activeClass: 'bg-green' },
]

// The Default / Exam switch. Default lights up ember, Exam lights up green.
export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Mode"
      className="inline-flex rounded-full border border-line bg-surface p-1 text-sm"
    >
      {MODES.map((item) => {
        const active = item.value === mode
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={`cursor-pointer rounded-full px-4 py-1.5 font-medium transition ${
              active ? `${item.activeClass} text-white shadow-sm` : 'text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
