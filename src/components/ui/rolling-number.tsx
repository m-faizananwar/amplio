"use client"

import { cn } from "@/lib/cn"

type Props = {
  value: number
  /** How the number reads, e.g. euros or a compact count. Defaults to en-US grouping. */
  format?: (value: number) => string
  className?: string
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const defaultFormat = (n: number) => n.toLocaleString("en-US")

// A number that rolls when it changes: each digit is a 0–9 strip moved with
// transform only. Mono + tabular (`num`), so the width never shifts. Place
// values are keyed from the right, so 99 → 100 rolls the right columns and
// adds one on the left instead of re-rolling everything. Screen readers get
// the formatted value once; the strips are hidden from them.
export function RollingNumber({ value, format = defaultFormat, className }: Props) {
  const text = format(value)
  const chars = text.split("")
  return (
    <span className={cn("num relative inline-flex overflow-hidden leading-none", className)} aria-label={text} role="text">
      {chars.map((char, index) => {
        const key = chars.length - index
        const digit = DIGITS.indexOf(char)
        if (digit < 0) return <span key={`s${key}`} aria-hidden="true">{char}</span>
        return (
          <span key={`d${key}`} aria-hidden="true" className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
            <span
              className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-(--duration-slow) ease-ledger motion-reduce:transition-none"
              style={{ transform: `translateY(-${digit}em)` }}
            >
              {DIGITS.map((d) => <span key={d} className="h-[1em] leading-none">{d}</span>)}
            </span>
          </span>
        )
      })}
    </span>
  )
}
