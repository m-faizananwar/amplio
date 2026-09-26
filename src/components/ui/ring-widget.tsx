"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { RollingNumber } from "./rolling-number"
import { cn } from "@/lib/cn"

export type RingSegment = { key: string; label: string; count: number; href: string }

type Props = {
  /** The card's title, e.g. "Collaborations". */
  label: string
  /** Under the total in the centre, e.g. "in progress". */
  totalLabel?: string
  segments: RingSegment[]
  className?: string
}

const TICKS = 60
const CENTER = 100
const INNER = 72
const OUTER = 90
const STAGGER_MS = 9
const TONE: Record<string, string> = { needs_you: "var(--attention)", waiting: "var(--ink-muted)", live: "var(--money)", done: "var(--ink)" }
const toneOf = (key: string) => TONE[key] ?? "var(--ink)"

// Ticks per segment in proportion to its count (largest remainder), at least
// one for any segment that has something in it.
function allocate(segments: RingSegment[]) {
  const total = segments.reduce((sum, s) => sum + s.count, 0)
  if (total === 0) return segments.map(() => 0)
  const raw = segments.map((s) => (s.count / total) * TICKS)
  const out = raw.map((r, i) => ((segments[i]?.count ?? 0) > 0 ? Math.max(1, Math.floor(r)) : 0))
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0])
  for (let k = 0; out.reduce((a, b) => a + b, 0) < TICKS && k < order.length * 2; k++) {
    const i = order[k % order.length]?.[1] ?? 0
    if ((segments[i]?.count ?? 0) > 0) out[i] = (out[i] ?? 0) + 1
  }
  while (out.reduce((a, b) => a + b, 0) > TICKS) {
    const i = out.indexOf(Math.max(...out))
    out[i] = (out[i] ?? 1) - 1
  }
  return out
}

function tick(index: number) {
  const angle = (index / TICKS) * 2 * Math.PI - Math.PI / 2
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x1: CENTER + INNER * cos, y1: CENTER + INNER * sin, x2: CENTER + OUTER * cos, y2: CENTER + OUTER * sin }
}

// Switches on once, the first time the dial scrolls into view.
function useEntered<T extends Element>() {
  const ref = useRef<T>(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setEntered(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, entered] as const
}

// A dial of small ticks round a centre disc, one coloured arc per state; the
// ticks switch on one after another when it enters (9 ms apart, 360 ms each).
// Each arc, and each legend row, opens that state's filter. Hovering or
// focusing one names it in the centre.
export function RingWidget({ label, totalLabel, segments, className }: Props) {
  const [ref, entered] = useEntered<HTMLDivElement>()
  const [active, setActive] = useState<string | null>(null)
  const total = segments.reduce((sum, s) => sum + s.count, 0)
  const ticks = allocate(segments)
  const focus = segments.find((s) => s.key === active) ?? null
  const offsets = ticks.map((_, i) => ticks.slice(0, i).reduce((a, b) => a + b, 0))
  const arcs = segments.map((segment, i) => ({ segment, indices: Array.from({ length: ticks[i] ?? 0 }, (_, k) => (offsets[i] ?? 0) + k) }))
  const used = ticks.reduce((a, b) => a + b, 0)
  const idle = Array.from({ length: TICKS - used }, (_, k) => used + k)

  return (
    <div ref={ref} className={cn("flex flex-col gap-5 rounded-card border border-rule bg-surface p-5 shadow-lift sm:flex-row sm:items-center", className)}>
      <div className="relative mx-auto size-48 shrink-0 sm:mx-0">
        <svg viewBox="0 0 200 200" className="size-full" role="img" aria-label={`${label}: ${total}`}>
          <circle cx={CENTER} cy={CENTER} r="58" fill="var(--paper)" stroke="var(--rule)" />
          {idle.map((i) => <line key={`idle-${i}`} {...tick(i)} stroke="var(--rule)" strokeWidth="4" strokeLinecap="round" />)}
          {arcs.map(({ segment, indices }) => (
            <Link
              key={segment.key}
              href={segment.href}
              aria-label={`${segment.label}: ${segment.count}`}
              onMouseEnter={() => setActive(segment.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(segment.key)}
              onBlur={() => setActive(null)}
              className="outline-none"
            >
              {indices.map((i) => (
                <line
                  key={i}
                  {...tick(i)}
                  stroke={toneOf(segment.key)}
                  strokeWidth={active === segment.key ? 6 : 4}
                  strokeLinecap="round"
                  className="ring-tick"
                  data-on={entered || undefined}
                  style={{ transitionDelay: `${i * STAGGER_MS}ms`, opacity: active && active !== segment.key ? 0.35 : undefined }}
                />
              ))}
            </Link>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-h2 font-semibold leading-none"><RollingNumber value={focus ? focus.count : total} /></span>
          <span className="mt-1 max-w-24 truncate text-caption text-ink-muted">{focus ? focus.label : totalLabel ?? label}</span>
        </div>
      </div>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="text-small font-medium text-ink">{label}</p>
        <ul className="grid gap-0.5">
          {segments.map((segment) => (
            <li key={segment.key}>
              <Link
                href={segment.href}
                onMouseEnter={() => setActive(segment.key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(segment.key)}
                onBlur={() => setActive(null)}
                className={cn("flex h-9 items-center gap-2.5 rounded-control px-2 text-body outline-none transition-colors duration-(--duration-fast) hover:bg-well focus-visible:ring-2 focus-visible:ring-money", active === segment.key && "bg-well")}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: toneOf(segment.key) }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{segment.label}</span>
                <span className="num text-small text-ink-muted">{segment.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
