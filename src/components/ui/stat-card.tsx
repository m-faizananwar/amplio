"use client"

import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { RollingNumber } from "./rolling-number"
import { Sparkline } from "./sparkline"

type Delta = { label: string; direction: "up" | "down" | "flat"; /** is this direction good news? */ good?: boolean }

type Props = {
  label: ReactNode
  value: number
  format?: (value: number) => string
  hint?: ReactNode
  delta?: Delta
  spark?: number[]
  /** Money and verified attribution get the accent; everything else is ink. */
  tone?: "ink" | "money"
  /** Opens the trail: the rows this number is made of. Without it the card is static. */
  onOpen?: () => void
  openLabel?: string
  className?: string
}

// Every number is a receipt (DECISIONS.md): a StatCard with `onOpen` is a
// button that opens the rows behind it. Mono tabular value that rolls on change.
export function StatCard({ label, value, format, hint, delta, spark, tone = "ink", onOpen, openLabel = "Show rows", className }: Props) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-small text-ink-muted">{label}</p>
        {spark ? <Sparkline points={spark} tone={tone} /> : null}
      </div>
      <p className={cn("mt-2 text-h2 font-semibold tracking-(--tracking-heading)", tone === "money" ? "text-money" : "text-ink")}>
        <RollingNumber value={value} format={format} />
      </p>
      <div className="mt-2 flex min-h-5 items-end justify-between gap-3 text-caption">
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-ink-muted">
          {delta ? <DeltaBadge delta={delta} /> : null}
          {hint}
        </span>
        {onOpen ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-medium text-ink-muted transition-colors duration-(--duration-fast) group-hover/stat:text-ink">
            {openLabel}
            <ChevronRight className="size-3.5 transition-transform duration-(--duration-fast) ease-ledger group-hover/stat:translate-x-0.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </>
  )
  const frame = "group/stat block w-full rounded-card border border-rule bg-surface p-5 text-left"
  if (!onOpen) return <div data-slot="stat-card" className={cn(frame, className)}>{body}</div>
  return (
    <button
      type="button"
      data-slot="stat-card"
      onClick={onOpen}
      className={cn(frame, "outline-none transition-[border-color,transform] duration-(--duration-fast) ease-ledger hover:border-rule-strong focus-visible:ring-3 focus-visible:ring-ink/15 active:translate-y-px", className)}
    >
      {body}
    </button>
  )
}

function DeltaBadge({ delta }: { delta: Delta }) {
  const Icon = delta.direction === "down" ? ArrowDownRight : ArrowUpRight
  const colour = delta.direction === "flat" ? "text-ink-muted" : delta.good === false ? "text-failure" : delta.good ? "text-money" : "text-ink"
  return (
    <span className={cn("num inline-flex items-center gap-0.5 font-medium", colour)}>
      {delta.direction === "flat" ? null : <Icon className="size-3.5" aria-hidden="true" />}
      {delta.label}
    </span>
  )
}
