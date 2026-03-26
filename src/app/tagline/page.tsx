'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  TextStaggerHover,
  TextStaggerHoverActive,
  TextStaggerHoverHidden,
} from '@/components/ui/text-stagger-hover'

// The three tagline lines — each enters from the bottom, staggered
const LINES = [
  'Drop Your Idea.',
  'Simulate the Risk.',
  'Know Before You Build.',
]

// How long this frame stays before auto-advancing to the globe
const FRAME_DURATION_MS = 8000

export default function TaglinePage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Trigger entrance after mount
  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(enterTimer)
  }, [])

  // Auto-advance after 8s
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => router.push('/explore'), 800) // wait for exit anim
    }, FRAME_DURATION_MS)
    return () => clearTimeout(exitTimer)
  }, [router])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">

      {/* Zona wordmark */}
      <div className="absolute top-8 left-10 z-10">
        <span className="text-white text-sm tracking-[0.3em] uppercase font-extralight opacity-60">
          Zona
        </span>
      </div>

      {/* Taglines */}
      <div className="flex flex-col items-center gap-2 text-center">
        {LINES.map((line, i) => (
          <motion.div
            key={line}
            initial={{ y: 60, opacity: 0 }}
            animate={visible && !exiting ? { y: 0, opacity: 1 } : exiting ? { y: -40, opacity: 0 } : { y: 60, opacity: 0 }}
            transition={{
              delay: visible ? i * 0.18 : 0,
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <TextStaggerHover as="h2" className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              {/* At rest: full opacity, slides up on hover */}
              <TextStaggerHoverActive
                animation="bottom"
                staggerDirection="middle"
                className="opacity-100"
              >
                {line}
              </TextStaggerHoverActive>

              {/* On hover: slides up from bottom in white/60 */}
              <TextStaggerHoverHidden
                animation="bottom"
                staggerDirection="middle"
                className="text-white/40"
              >
                {line}
              </TextStaggerHoverHidden>
            </TextStaggerHover>
          </motion.div>
        ))}
      </div>

      {/* Progress bar at bottom — drains over 8s */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
        <motion.div
          className="h-full bg-white/20"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: FRAME_DURATION_MS / 1000, ease: 'linear' }}
        />
      </div>

      {/* Skip hint */}
      <button
        onClick={() => router.push('/explore')}
        className="absolute bottom-6 right-8 text-white/20 text-xs tracking-widest uppercase hover:text-white/50 transition-colors"
      >
        Skip
      </button>
    </div>
  )
}
