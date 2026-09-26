"use client"

import { addDays, addMonths, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/cn"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type Props = {
  /** yyyy-mm-dd, or null when nothing is picked. */
  value: string | null
  onValueChange: (value: string) => void
  /** Earliest pickable day, yyyy-mm-dd (a post date can't be in the past). */
  min?: string
  placeholder: string
  id?: string
  weekdayLabels?: [string, string, string, string, string, string, string]
  previousLabel?: string
  nextLabel?: string
  className?: string
}

const ISO = "yyyy-MM-dd"
const MON: { weekStartsOn: 1 } = { weekStartsOn: 1 }

// A field whose value reads as segmented chips (day · month · year) and opens
// a one-month grid in the panel style. Days are real buttons (Tab/Enter work);
// days before `min` are disabled, not hidden.
export function DatePicker({ value, onValueChange, min, placeholder, id, weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], previousLabel = "Previous month", nextLabel = "Next month", className }: Props) {
  const selected = value ? parseISO(value) : null
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => startOfMonth(selected ?? new Date()))
  const floor = min ? parseISO(min) : null

  function pick(day: Date) {
    onValueChange(format(day, ISO))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        data-empty={!selected}
        className={cn("field-control", className)}
      >
        <CalendarDays className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
        {selected ? (
          <span className="flex items-center gap-1" aria-label={format(selected, "d MMMM yyyy")}>
            <span className="field-segment">{format(selected, "dd")}</span>
            <span className="field-segment">{format(selected, "MMM")}</span>
            <span className="field-segment">{format(selected, "yyyy")}</span>
          </span>
        ) : <span className="truncate text-ink-muted">{placeholder}</span>}
        <span className="field-chevron"><ChevronDown aria-hidden="true" /></span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-2 p-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, -1))} aria-label={previousLabel}><ChevronLeft /></Button>
          <p className="text-body font-medium" aria-live="polite">{format(month, "MMMM yyyy")}</p>
          <Button variant="ghost" size="icon-sm" onClick={() => setMonth(addMonths(month, 1))} aria-label={nextLabel}><ChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center" role="grid">
          {weekdayLabels.map((d) => <span key={d} className="py-1 text-caption text-ink-muted">{d}</span>)}
          {daysOf(month).map((day) => {
            const disabled = floor ? isBefore(day, floor) && !isSameDay(day, floor) : false
            const isSelected = selected ? isSameDay(day, selected) : false
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => pick(day)}
                aria-pressed={isSelected}
                aria-label={format(day, "d MMMM yyyy")}
                className={cn(
                  "num grid h-9 place-items-center rounded-full text-small outline-none transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-money disabled:pointer-events-none disabled:opacity-35",
                  isSameMonth(day, month) ? "text-ink" : "text-ink-muted/60",
                  isSelected ? "bg-money text-surface" : "hover:bg-well",
                  isSameDay(day, new Date()) && !isSelected && "font-semibold underline underline-offset-4"
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function daysOf(month: Date) {
  const days: Date[] = []
  for (let d = startOfWeek(startOfMonth(month), MON); d <= endOfWeek(endOfMonth(month), MON); d = addDays(d, 1)) days.push(d)
  return days
}
