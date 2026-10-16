type Props = {
  count: number
  max?: number // draw at most this many marks, then show "+n"
  className?: string
}

// Streak as tally marks: four upright strokes and a diagonal for every five.
export default function Tally({ count, max = 30, className = '' }: Props) {
  const drawn = Math.min(count, max)
  const groups = Math.ceil(drawn / 5)

  if (count === 0) return <span className={`text-sm opacity-60 ${className}`}>No marks yet</span>

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: groups }, (_, g) => {
        const inGroup = Math.min(5, drawn - g * 5)
        return (
          <svg key={g} viewBox="0 0 34 24" width="34" height="24">
            {Array.from({ length: Math.min(4, inGroup) }, (_, i) => (
              <line
                key={i}
                x1={5 + i * 7}
                y1={3}
                x2={4 + i * 7}
                y2={21}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            {inGroup === 5 && (
              <line x1="1" y1="17" x2="31" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        )
      })}
      {count > max && <span className="nums text-sm">+{count - max}</span>}
    </span>
  )
}
