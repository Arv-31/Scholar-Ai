type Props = {
  value: number // 0-100
  tone?: 'green' | 'ember' | 'light'
  label: string // read out by screen readers
}

const FILL = { green: 'bg-green', ember: 'bg-ember', light: 'bg-white' }
const TRACK = { green: 'bg-line', ember: 'bg-line', light: 'bg-white/15' }

// Thin rounded bar used for unit, subject and video progress.
export default function ProgressBar({ value, tone = 'green', label }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 w-full overflow-hidden rounded-full ${TRACK[tone]}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${FILL[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
