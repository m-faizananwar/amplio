"use client"

import { type PointerEvent, useState } from "react"
import { cn } from "@/lib/cn"

type Props = {
  points: number[]
  className?: string
  tone?: "ink" | "money"
  /** One per point (e.g. the day); shown with the value while scrubbing. */
  labels?: string[]
  format?: (value: number) => string
}

const W = 100
const H = 28

// A 100×28 line in the card's corner: shape first — it draws itself in, and
// moving the pointer across it scrubs to the nearest point and names it
// (value · label). The trail still has every row.
export function Sparkline({ points, className, tone = "ink", labels, format = String }: Props) {
  const [at, setAt] = useState<number | null>(null)
  if (points.length < 2) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = W / (points.length - 1)
  const y = (p: number) => H - ((p - min) / span) * (H - 2) - 1
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${y(p).toFixed(2)}`).join(" ")
  const scrub = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setAt(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)))
  }
  return (
    <span className={cn("relative inline-flex", tone === "money" ? "text-money" : "text-ink-muted", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="h-7 w-24 overflow-visible" onPointerMove={scrub} onPointerLeave={() => setAt(null)}>
        <path d={d} pathLength={1} className="g-draw" style={{ "--g-dur": "600ms" } as React.CSSProperties} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {at !== null ? <line x1={at * step} x2={at * step} y1={0} y2={H} stroke="currentColor" strokeOpacity="0.3" vectorEffect="non-scaling-stroke" /> : null}
      </svg>
      {at !== null ? (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" style={{ left: `${(at * step)}%`, top: `${(y(points[at]) / H) * 100}%` }} />
          <span aria-hidden="true" className="num pointer-events-none absolute bottom-full right-0 mb-1 whitespace-nowrap rounded-chip bg-ink px-1.5 py-0.5 text-caption text-paper">
            {format(points[at])}{labels?.[at] ? ` · ${labels[at]}` : ""}
          </span>
        </>
      ) : null}
    </span>
  )
}
