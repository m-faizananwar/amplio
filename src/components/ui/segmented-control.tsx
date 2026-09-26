"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/cn"

type Option<T extends string> = { value: T; label: React.ReactNode }

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>
  value: T
  onValueChange: (value: T) => void
  /** Accessible name for the group, e.g. "I am a". */
  label: string
  size?: "default" | "sm"
  className?: string
}

// A radio group drawn as one control with a sliding thumb. Radios, not
// buttons: arrow keys move the choice, and a screen reader hears "1 of 3".
export function SegmentedControl<T extends string>({ options, value, onValueChange, label, size = "default", className }: Props<T>) {
  const root = useRef<HTMLDivElement>(null)
  // the thumb as two edges, so they can move one after the other (inchworm)
  const [thumb, setThumb] = useState<{ left: number; right: number; dir: "left" | "right" | undefined } | null>(null)

  useLayoutEffect(() => {
    const box = root.current
    const el = box?.querySelector<HTMLElement>("[data-checked]")
    if (!box || !el) return
    const left = el.offsetLeft
    const right = box.clientWidth - el.offsetLeft - el.offsetWidth
    setThumb((prev) => ({ left, right, dir: prev ? (left > prev.left ? "right" : left < prev.left ? "left" : prev.dir) : undefined }))
  }, [value, options])

  return (
    <RadioGroup
      ref={root}
      aria-label={label}
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn("relative inline-flex rounded-control bg-tint p-0.5", className)}
    >
      {thumb ? (
        <span
          aria-hidden="true"
          data-activation-direction={thumb.dir}
          className="inchworm absolute top-0.5 bottom-0.5 rounded-[calc(var(--radius-control)-2px)] bg-surface shadow-lift"
          style={{ "--iw-l": `${thumb.left}px`, "--iw-r": `${thumb.right}px` } as React.CSSProperties}
        />
      ) : null}
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          className={cn(
            "inchworm-label relative z-10 inline-flex items-center justify-center rounded-[calc(var(--radius-control)-2px)] font-medium text-ink-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-money data-checked:text-ink",
            size === "sm" ? "h-7 px-2.5 text-small" : "h-8 px-3.5 text-body"
          )}
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}
