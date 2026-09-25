"use client"

import type { CSSProperties } from "react"
import { cn } from "@/lib/cn"

type Props = {
  value: number
  /** How the number reads, e.g. euros or a compact count. Defaults to en-US grouping. */
  format?: (value: number) => string
  className?: string
}

const defaultFormat = (n: number) => n.toLocaleString("en-US")

// A number that rolls when it changes. Each digit is a 0–9 column drawn with
// CSS pseudo-content (.roll-digit in globals.css) and moved with transform
// only, so the page's text — what you select, copy, or a screen reader or
// test reads — is just the number, once. Mono + tabular (`num`), so the width
// never shifts. Place values are keyed from the right, so 99 → 100 rolls the
// right columns and adds one on the left instead of re-rolling everything.
export function RollingNumber({ value, format = defaultFormat, className }: Props) {
  const text = format(value)
  const chars = text.split("")
  return (
    <span className={cn("num relative inline-flex leading-none", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex select-none">
        {chars.map((char, index) => {
          const key = chars.length - index
          return /\d/.test(char)
            ? <span key={`d${key}`} className="roll-digit" style={{ "--d": Number(char) } as CSSProperties} />
            : <span key={`s${key}`} className="roll-char" data-char={char} />
        })}
      </span>
    </span>
  )
}
