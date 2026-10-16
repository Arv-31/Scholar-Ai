type Props = {
  value: number // 0-100
  tone?: 'green' | 'ember' | 'light'
  label: string // read out by screen readers
}

const FILL = { green: 'bg-green', ember: 'bg-ember', light: 'bg-[#edebe3]' }
const RULE = { green: 'bg-ink/25', ember: 'bg-ink/25', light: 'bg-white/25' }

// A thin ruled line with a filled segment (like a ruler), used for unit, subject and video progress.
export default function ProgressBar({ value, tone = 'green', label }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative h-[3px] w-full"
    >
      <div className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 ${RULE[tone]}`} />
      <div
        className={`relative h-full transition-[width] duration-500 ${FILL[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
