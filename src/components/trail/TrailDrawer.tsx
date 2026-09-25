"use client"

import { Download } from "lucide-react"
import type { ReactNode } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { TrailLoader } from "@/components/graphics/TrailLoader"
import type { TrailRow } from "./types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** The number the rows add up to, as shown on the card. */
  total: ReactNode
  rows: TrailRow[]
  loading?: boolean
  emptyText: ReactNode
  exportHref?: string
  exportLabel?: string
  formatAmount?: (cents: number) => string
  formatTime?: (iso: string) => string
}

const ROWS_SKELETON = 6

// The signature pattern: a number opens the rows it is made of, newest first,
// each with its time and where it came from. If a number can't be traced to
// rows it isn't shown — so this drawer is never empty for a real metric; the
// empty text is for a zero.
export function TrailDrawer({ open, onOpenChange, title, total, rows, loading, emptyText, exportHref, exportLabel = "Export CSV", formatAmount, formatTime }: Props) {
  const time = formatTime ?? ((iso: string) => iso.slice(0, 16).replace("T", " "))
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        heading={title}
        description={<span className="num text-ink">{total}</span>}
        width="wide"
        footer={exportHref ? (
          <a href={exportHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <Download aria-hidden="true" />
            {exportLabel}
          </a>
        ) : undefined}
      >
        {loading ? <TrailSkeleton /> : rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-body text-ink-muted">{emptyText}</p>
        ) : (
          <ol className="divide-y divide-rule">
            {rows.map((row, i) => (
              <li key={row.id} className="relative grid grid-cols-[8.5rem_1fr_auto] items-baseline gap-3 px-5 py-2.5 animate-rise" style={i < 12 ? { animationDelay: `${i * 20}ms` } : undefined}>
                {i === 0 ? <TrailLead /> : null}
                <time dateTime={row.at} className="num text-caption text-ink-muted">{time(row.at)}</time>
                <div className="min-w-0">
                  <p className="truncate text-body text-ink">
                    {row.href ? <a href={row.href} className="hover:underline">{row.title}</a> : row.title}
                  </p>
                  {row.detail ? <p className="truncate text-caption text-ink-muted">{row.detail}</p> : null}
                </div>
                <span className="flex items-center gap-2">
                  {row.source ? <span className="rounded-chip bg-tint px-2 py-0.5 text-caption text-ink-muted">{row.source}</span> : null}
                  {row.amountCents !== undefined && formatAmount ? (
                    <span className={`num text-small ${row.amountCents < 0 ? "text-ink" : "text-money"}`}>{formatAmount(row.amountCents)}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// The total sits just above the list, in the drawer's header. A line drops
// from it to the first row and ends in a dot: the number and the row it
// starts from, joined the way the mark joins its dots.
function TrailLead() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 w-px">
      <span className="absolute top-0 left-0 h-1/2 w-px origin-top bg-ink animate-drop" />
      <span className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink animate-pop-in [animation-delay:180ms]" />
    </span>
  )
}

function TrailSkeleton() {
  return (
    <div className="divide-y divide-rule" aria-busy="true">
      <div className="px-5 py-3"><TrailLoader /></div>
      {Array.from({ length: ROWS_SKELETON }, (_, i) => (
        <div key={i} className="grid grid-cols-[8.5rem_1fr_auto] gap-3 px-5 py-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      ))}
    </div>
  )
}
