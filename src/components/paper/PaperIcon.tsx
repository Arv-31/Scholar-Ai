type Props = {
  value: number // 0-100
  size?: number // width in px
}

// Small 2D paper for lists: crushed and tilted at 0%, a clean flat sheet at 100%.
// (Only the big hero paper is 3D; twenty WebGL canvases on one page would be slow.)
export default function PaperIcon({ value, size = 28 }: Props) {
  const crush = 1 - Math.max(0, Math.min(100, value)) / 100
  const points = OUTLINE.map(([x, y], i) => {
    // pull each outline point toward the middle by its own amount, more when crushed
    const pull = crush * (0.18 + JITTER[i] * 0.3)
    return `${(x + (50 - x) * pull).toFixed(1)},${(y + (50 - y) * pull).toFixed(1)}`
  }).join(' ')

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      style={{ transform: `rotate(${(crush * 14).toFixed(1)}deg)` }}
    >
      <polygon
        points={points}
        fill="#fbf9f3"
        stroke="var(--color-ink)"
        strokeWidth={size > 60 ? 1.5 : 4}
        strokeLinejoin="round"
      />
      {/* crease lines fade out as the paper flattens */}
      <g stroke="#14161a" strokeWidth={size > 60 ? 1 : 2.5} fill="none" opacity={crush * 0.45}>
        <polyline points="22,30 48,46 40,70 66,78" />
        <polyline points="70,20 56,44 80,58" />
        <polyline points="30,82 46,58" />
      </g>
    </svg>
  )
}

// A 3:2-ish sheet outline (16 points, clockwise) and a fixed "random" pull for each point.
const OUTLINE: [number, number][] = [
  [8, 18],
  [30, 18],
  [50, 18],
  [70, 18],
  [92, 18],
  [92, 34],
  [92, 50],
  [92, 66],
  [92, 82],
  [70, 82],
  [50, 82],
  [30, 82],
  [8, 82],
  [8, 66],
  [8, 50],
  [8, 34],
]
const JITTER = [0.9, 0.2, 0.7, 0.35, 1, 0.5, 0.15, 0.8, 0.95, 0.3, 0.6, 0.1, 0.85, 0.4, 0.75, 0.25]
