'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

// ── Types ────────────────────────────────────────────────────────────────────

export type StaggerDirection = 'start' | 'middle' | 'end'
export type AnimationT = 'left' | 'right' | 'top' | 'bottom' | 'z' | 'blur' | undefined

export interface StaggerOptions {
  direction?: StaggerDirection
  staggerValue?: number
  totalItems: number
  index: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function setStaggerDirection({ direction = 'start', staggerValue = 0.02, totalItems, index }: StaggerOptions): number {
  switch (direction) {
    case 'start':  return index * staggerValue
    case 'middle': return Math.abs(index - Math.floor(totalItems / 2)) * staggerValue
    case 'end':    return (totalItems - 1 - index) * staggerValue
    default:       return 0
  }
}

export interface SplitTextResult {
  words: string[]
  characters: string[]
  wordCount: number
  characterCount: number
}

export function splitText(text: string): SplitTextResult {
  if (!text?.trim()) return { words: [], characters: [], wordCount: 0, characterCount: 0 }
  const words = text.split(' ').map((w) => w.concat(' '))
  const characters = words.map((w) => w.split('')).flat()
  return { words, characters, wordCount: words.length, characterCount: characters.length }
}

export function useAnimationVariants(animation?: AnimationT) {
  return React.useMemo(() => ({
    hidden: {
      x: animation === 'left' ? '-100%' : animation === 'right' ? '100%' : 0,
      y: animation === 'top'  ? '-100%' : animation === 'bottom' ? '100%' : 0,
      scale: animation === 'z' ? 0 : 1,
      filter: animation === 'blur' ? 'blur(10px)' : 'blur(0px)',
      opacity: 0,
    },
    visible: { x: 0, y: 0, scale: 1, filter: 'blur(0px)', opacity: 1 },
  }), [animation])
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ContextValue { isMouseIn: boolean }
const TextStaggerHoverContext = React.createContext<ContextValue | undefined>(undefined)

function useCtx() {
  const ctx = React.useContext(TextStaggerHoverContext)
  if (!ctx) throw new Error('Must be used inside TextStaggerHover')
  return ctx
}

// ── Components ───────────────────────────────────────────────────────────────

interface WrapperProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

export const TextStaggerHover = ({ as: Component = 'span', children, className, ...props }: WrapperProps) => {
  const [isMouseIn, setIsMouseIn] = React.useState(false)
  return (
    <TextStaggerHoverContext.Provider value={{ isMouseIn }}>
      <Component
        className={cn('relative inline-block overflow-hidden', className)}
        onMouseEnter={() => setIsMouseIn(true)}
        onMouseLeave={() => setIsMouseIn(false)}
        {...props}
      >
        {children}
      </Component>
    </TextStaggerHoverContext.Provider>
  )
}

interface ContentProps extends HTMLMotionProps<'span'> {
  animation?: AnimationT
  staggerDirection?: StaggerDirection
}

// Visible at rest — slides away on hover
export const TextStaggerHoverActive = ({ animation, staggerDirection = 'start', children, className, transition, ...props }: ContentProps) => {
  const { characters, characterCount } = splitText(String(children))
  const variants = useAnimationVariants(animation)
  const { isMouseIn } = useCtx()
  return (
    <span className={cn('inline-block text-nowrap', className)}>
      {characters.map((char, i) => (
        <motion.span
          className="inline-block"
          key={`active-${i}`}
          variants={variants}
          animate={isMouseIn ? 'hidden' : 'visible'}
          transition={{ delay: setStaggerDirection({ direction: staggerDirection, totalItems: characterCount, index: i }), ease: [0.25, 0.46, 0.45, 0.94], duration: 0.3, ...transition }}
          {...props}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

// Hidden at rest — slides in on hover
export const TextStaggerHoverHidden = ({ animation, staggerDirection = 'start', children, className, transition, ...props }: ContentProps) => {
  const { characters, characterCount } = splitText(String(children))
  const variants = useAnimationVariants(animation)
  const { isMouseIn } = useCtx()
  return (
    <span className={cn('inline-block absolute left-0 top-0 text-nowrap', className)}>
      {characters.map((char, i) => (
        <motion.span
          className="inline-block"
          key={`hidden-${i}`}
          variants={variants}
          animate={isMouseIn ? 'visible' : 'hidden'}
          transition={{ delay: setStaggerDirection({ direction: staggerDirection, totalItems: characterCount, index: i }), ease: [0.25, 0.46, 0.45, 0.94], duration: 0.3, ...transition }}
          {...props}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
