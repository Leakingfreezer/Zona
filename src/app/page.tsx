'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [enterVisible, setEnterVisible] = useState(false)
  const router = useRouter()

  // Fade in the Enter button after the animation has had time to establish
  useEffect(() => {
    const timer = setTimeout(() => setEnterVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Full-screen spiral animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {/* App name — top left */}
      <div className="absolute top-8 left-10 z-10">
        <span className="text-white text-sm tracking-[0.3em] uppercase font-extralight opacity-60">
          Zona
        </span>
      </div>

      {/* Centred Enter button — fades in after 2s */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3 transition-all duration-1000 ease-out ${
          enterVisible ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-[-40%]'
        }`}
      >
        <p className="text-white/40 text-xs tracking-[0.25em] uppercase">
          Explore opportunities across the globe
        </p>
        <button
          onClick={() => router.push('/tagline')}
          className="text-white text-2xl tracking-[0.2em] uppercase font-extralight transition-all duration-700 hover:tracking-[0.35em] animate-pulse"
        >
          Enter
        </button>
      </div>
    </div>
  )
}
