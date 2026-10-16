import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  index?: number // position in the page; each step waits 50 ms longer
  className?: string
  children: ReactNode
}

// Fade-and-rise entrance for page blocks, staggered so they arrive one after another.
// Reduced motion is handled by <MotionConfig reducedMotion="user"> in AppShell.
export default function Reveal({ index = 0, className, children }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.06 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
