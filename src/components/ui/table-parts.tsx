"use client"

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "cn"
import { TableCell, TableHead, TableRow } from "./table"

export type SortDirection = "asc" | "desc"

type SortableProps = {
  children: ReactNode
  /** This column's current direction, or null when another column sorts. */
  direction: SortDirection | null
  onSort: () => void
  align?: "left" | "right"
  className?: string
}

// A header cell that sorts: a real button inside the <th>, aria-sort on the
// cell, the arrow says which way. Right-aligned for number columns.
export function SortableHead({ children, direction, onSort, align = "left", className }: SortableProps) {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown
  return (
    <TableHead
      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
      className={cn(align === "right" && "text-right", className)}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded-[6px] px-1 py-0.5 outline-none transition-colors duration-(--duration-fast) hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/15",
          direction && "text-ink",
          align === "right" && "flex-row-reverse"
        )}
      >
        {children}
        <Icon className={cn("size-3.5", !direction && "opacity-40")} aria-hidden="true" />
      </button>
    </TableHead>
  )
}

// The whole body when there are no rows: one cell across every column that
// holds an EmptyState (which says the next step).
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="p-4 whitespace-normal">{children}</TableCell>
    </TableRow>
  )
}

/** Flip or start a sort: same column flips, a new column starts descending (biggest first). */
export function nextSort<K extends string>(current: { key: K; direction: SortDirection }, key: K): { key: K; direction: SortDirection } {
  if (current.key !== key) return { key, direction: "desc" }
  return { key, direction: current.direction === "desc" ? "asc" : "desc" }
}
