import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { clearLanding, readLanding } from '../../lib/landing'

// After login, the home page opens through a growing circle (about 1.4 s), centred where the
// celestial arrow hit the card: out of the blast's light after email login, out of the night
// sky after Google sign-in. Plays once.
// Login.tsx (email) or the Google button sets the flag in sessionStorage before leaving.

export default function LandingReveal() {
  const [landing] = useState(readLanding)
  const [done, setDone] = useState(false)

  useEffect(clearLanding, [])

  if (!landing || done) return null

  const { x, y, fade, bright } = landing
  const cover = bright ? '#fff8e6' : '#060a16'
  const w = window.innerWidth
  const h = window.innerHeight
  const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))

  if (fade) {
    return (
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50"
        style={{ background: cover }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
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
            transition={{ duration: 1.4, ease: [0.45, 0, 0.2, 1] }}
            onAnimationComplete={() => setDone(true)}
          />
        </mask>
      </defs>
      <rect width={w} height={h} fill={cover} mask="url(#landing-hole)" />
    </svg>
  )
}
