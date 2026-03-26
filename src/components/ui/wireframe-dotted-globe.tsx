"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useRouter } from "next/navigation"

// Cities available on the globe — only Toronto is unlocked for now
const CITIES = [
  {
    name: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    unlocked: true,
    route: "/map",
  },
]

interface GlobeProps {
  width?: number
  height?: number
  className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const router = useRouter()

  // Refs shared between the effect and the render loop
  const projectionRef = useRef<d3.GeoProjection | null>(null)
  const pulseRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.5

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    projectionRef.current = projection

    const path = d3.geoPath().projection(projection).context(context)

    // ── Dot generation helpers ──────────────────────────────────────────────

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }
      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const { type, coordinates } = feature.geometry
      if (type === "Polygon") {
        if (!pointInPolygon(point, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false
        }
        return true
      } else if (type === "MultiPolygon") {
        for (const polygon of coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) { inHole = true; break }
            }
            if (!inHole) return true
          }
        }
        return false
      }
      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16): [number, number][] => {
      const dots: [number, number][] = []
      const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature)
      const step = dotSpacing * 0.08
      for (let lng = minLng; lng <= maxLng; lng += step) {
        for (let lat = minLat; lat <= maxLat; lat += step) {
          const pt: [number, number] = [lng, lat]
          if (pointInFeature(pt, feature)) dots.push(pt)
        }
      }
      return dots
    }

    // ── Render ──────────────────────────────────────────────────────────────

    interface DotData { lng: number; lat: number }
    const allDots: DotData[] = []
    let landFeatures: any

    const render = (pulse: number) => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const sf = currentScale / radius   // scale factor for line widths

      // Globe background (ocean)
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = "rgba(255,255,255,0.15)"
      context.lineWidth = 1.5 * sf
      context.stroke()

      if (!landFeatures) return

      // Graticule (grid lines)
      const graticule = d3.geoGraticule()
      context.beginPath()
      path(graticule())
      context.strokeStyle = "#ffffff"
      context.lineWidth = 0.5 * sf
      context.globalAlpha = 0.12
      context.stroke()
      context.globalAlpha = 1

      // Land outlines
      context.beginPath()
      landFeatures.features.forEach((f: any) => path(f))
      context.strokeStyle = "rgba(255,255,255,0.35)"
      context.lineWidth = 0.8 * sf
      context.stroke()

      // Land halftone dots
      allDots.forEach((dot) => {
        const projected = projection([dot.lng, dot.lat])
        if (!projected) return
        const [px, py] = projected
        if (px < 0 || px > containerWidth || py < 0 || py > containerHeight) return
        context.beginPath()
        context.arc(px, py, 1.1 * sf, 0, 2 * Math.PI)
        context.fillStyle = "#555555"
        context.fill()
      })

      // ── City pins ───────────────────────────────────────────────────────
      CITIES.forEach((city) => {
        const projected = projection([city.lng, city.lat])
        if (!projected) return
        const [cx, cy] = projected

        // Check if the city is on the visible hemisphere
        const visible = d3.geoDistance([city.lng, city.lat], (projection.invert?.([containerWidth / 2, containerHeight / 2]) ?? [0, 0]) as [number, number]) < Math.PI / 2
        if (!visible) return

        if (city.unlocked) {
          // Pulsing ring
          const maxR = 18 * sf
          const ringR = maxR * pulse
          const ringAlpha = 1 - pulse

          context.beginPath()
          context.arc(cx, cy, ringR, 0, 2 * Math.PI)
          context.strokeStyle = `rgba(74,222,128,${ringAlpha * 0.6})`
          context.lineWidth = 1.5 * sf
          context.stroke()

          // Solid green dot
          context.beginPath()
          context.arc(cx, cy, 5 * sf, 0, 2 * Math.PI)
          context.fillStyle = "#4ade80"
          context.shadowColor = "#4ade80"
          context.shadowBlur = 12
          context.fill()
          context.shadowBlur = 0

          // Inner bright core
          context.beginPath()
          context.arc(cx, cy, 2.5 * sf, 0, 2 * Math.PI)
          context.fillStyle = "#ffffff"
          context.fill()
        }
      })
    }

    // ── Data loading ────────────────────────────────────────────────────────

    const loadWorldData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        )
        if (!res.ok) throw new Error("Failed to load land data")
        landFeatures = await res.json()

        landFeatures.features.forEach((feature: any) => {
          generateDotsInPolygon(feature, 16).forEach(([lng, lat]) => {
            allDots.push({ lng, lat })
          })
        })

        setIsLoading(false)
      } catch {
        setError("Failed to load globe data")
        setIsLoading(false)
      }
    }

    // ── Rotation & interaction ──────────────────────────────────────────────

    const rotation: [number, number] = [0, -20]
    let autoRotate = true

    const timer = d3.timer((elapsed) => {
      pulseRef.current = (elapsed % 1500) / 1500   // 0→1 every 1.5 s
      if (autoRotate) {
        rotation[0] += 0.3
        projection.rotate(rotation)
      }
      render(pulseRef.current)
    })

    const handleMouseDown = (e: MouseEvent) => {
      autoRotate = false
      const startX = e.clientX
      const startY = e.clientY
      const startRot: [number, number] = [...rotation] as [number, number]

      const onMove = (me: MouseEvent) => {
        rotation[0] = startRot[0] + (me.clientX - startX) * 0.5
        rotation[1] = Math.max(-90, Math.min(90, startRot[1] - (me.clientY - startY) * 0.5))
        projection.rotate(rotation)
      }
      const onUp = () => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
        setTimeout(() => { autoRotate = true }, 100)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const newScale = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * (e.deltaY > 0 ? 0.9 : 1.1)))
      projection.scale(newScale)
    }

    // Click: check if user clicked a city pin
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const sf = projection.scale() / radius

      CITIES.forEach((city) => {
        const projected = projection([city.lng, city.lat])
        if (!projected) return
        const dist = Math.hypot(projected[0] - mx, projected[1] - my)
        if (dist < 14 * sf && city.unlocked) {
          router.push(city.route)
        }
      })
    }

    // Hover: show city name label
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const sf = projection.scale() / radius
      let found: string | null = null

      CITIES.forEach((city) => {
        const projected = projection([city.lng, city.lat])
        if (!projected) return
        const dist = Math.hypot(projected[0] - mx, projected[1] - my)
        if (dist < 14 * sf) found = city.name
      })

      setHoveredCity(found)
      canvas.style.cursor = found ? "pointer" : "grab"
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("mousemove", handleMouseMove)

    loadWorldData()

    return () => {
      timer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [width, height, router])

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={overlayRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/40 text-xs tracking-widest uppercase">Loading globe...</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {/* City tooltip */}
      {hoveredCity && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 border border-green-500/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs tracking-widest uppercase">{hoveredCity}</span>
          <span className="text-white/30 text-xs">— click to explore</span>
        </div>
      )}

      <div className="absolute bottom-3 right-4 text-white/20 text-xs">
        drag to rotate · scroll to zoom
      </div>
    </div>
  )
}
