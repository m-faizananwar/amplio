import { cn } from "@/lib/cn"

type Props = { points: number[]; className?: string; tone?: "ink" | "money" }

const W = 100
const H = 28

// A 100×28 line in the card's corner: shape, not values — the trail has the values.
export function Sparkline({ points, className, tone = "ink" }: Props) {
  if (points.length < 2) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = W / (points.length - 1)
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(H - ((p - min) / span) * (H - 2) - 1).toFixed(2)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className={cn("h-7 w-24", tone === "money" ? "text-money" : "text-ink-muted", className)}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
