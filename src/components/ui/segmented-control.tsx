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
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>("[data-checked]")
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth })
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
          className="absolute top-0.5 bottom-0.5 rounded-[calc(var(--radius-control)-2px)] bg-surface shadow-[0_1px_2px_rgb(17_17_17/0.08)] transition-[translate,width] duration-(--duration-base) ease-ledger motion-reduce:transition-none"
          style={{ translate: `${thumb.left - 2}px 0`, width: thumb.width, left: 2 }}
        />
      ) : null}
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          className={cn(
            "relative z-10 inline-flex items-center justify-center rounded-[calc(var(--radius-control)-2px)] font-medium text-ink-muted outline-none transition-colors duration-(--duration-fast) ease-ledger hover:text-ink focus-visible:ring-2 focus-visible:ring-money data-checked:text-ink",
            size === "sm" ? "h-7 px-2.5 text-small" : "h-8 px-3.5 text-body"
          )}
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}
