type Props = { tone?: 'dark' | 'light' }

// The ScholarAI mark: a rising line from ember (start) to green (goal).
export default function Logo({ tone = 'dark' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${tone === 'light' ? 'text-white' : 'text-ink'}`}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="9"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <path
          d="M9 22 L15 15 L18 18 L23 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="22" r="2.5" fill="#E08A3C" />
        <circle cx="23" cy="10" r="2.5" fill="#2F9E63" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">
        Scholar<span className="text-green">AI</span>
      </span>
    </span>
  )
}
