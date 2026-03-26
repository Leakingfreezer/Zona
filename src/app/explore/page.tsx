"use client"

import dynamic from "next/dynamic"

const RotatingEarth = dynamic(
  () => import("@/components/ui/wireframe-dotted-globe"),
  { ssr: false, loading: () => null }
)

export default function ExplorePage() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">

      {/* Header */}
      <div className="absolute top-8 left-10 z-10">
        <span className="text-white text-sm tracking-[0.3em] uppercase font-extralight opacity-60">
          Zona
        </span>
      </div>

      {/* Prompt */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center">
        <p className="text-white/25 text-xs tracking-[0.3em] uppercase mb-1">
          Where do you want to fly?
        </p>
      </div>

      {/* Globe */}
      <div className="w-full max-w-3xl flex items-center justify-center">
        <RotatingEarth width={800} height={650} className="w-full" />
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-white/30 text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Available
        </span>
        <span className="text-white/10 text-xs">·</span>
        <span className="text-white/20 text-xs tracking-widest uppercase">
          More cities coming soon
        </span>
      </div>
    </div>
  )
}
