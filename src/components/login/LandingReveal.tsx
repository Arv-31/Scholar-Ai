import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { clearLanding, readLanding } from '../../lib/landing'

// After login, the home page opens out of the night sky through a growing circle,
// centred where the celestial arrow hit the card. Plays once.
// Login.tsx (email) or the Google button sets the flag in sessionStorage before leaving.

export default function LandingReveal() {
  const [landing] = useState(readLanding)
  const [done, setDone] = useState(false)

  useEffect(clearLanding, [])

  if (!landing || done) return null

  const { x, y, fade } = landing
  const w = window.innerWidth
  const h = window.innerHeight
  const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))

  if (fade) {
    return (
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 bg-[#060a16]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => setDone(true)}
      />
    )
  }

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <mask id="landing-hole">
          <rect width={w} height={h} fill="white" />
          <motion.circle
            cx={x}
            cy={y}
            fill="black"
            initial={{ r: 0 }}
            animate={{ r: radius }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setDone(true)}
          />
        </mask>
      </defs>
      <rect width={w} height={h} fill="#060a16" mask="url(#landing-hole)" />
    </svg>
  )
}
