"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/cn"

export type ComboboxOption = { value: string; label: string; hint?: string }

type Props = {
  options: ComboboxOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyText: string
  /** Accessible name when there is no visible <label> pointing at the input. */
  "aria-label"?: string
  id?: string
  className?: string
}

// Type to filter a long list (countries, creators, campaigns). The popup
// scales from the input's edge; items filter as you type, Enter picks.
export function Combobox({ options, value, onValueChange, placeholder, emptyText, id, className, ...aria }: Props) {
  const selected = options.find((o) => o.value === value) ?? null
  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selected}
      onValueChange={(next: ComboboxOption | null) => onValueChange(next?.value ?? null)}
      itemToStringLabel={(o: ComboboxOption) => o.label}
      isItemEqualToValue={(a: ComboboxOption, b: ComboboxOption) => a.value === b.value}
    >
      <div className={cn("relative", className)}>
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          aria-label={aria["aria-label"]}
          className="h-9 w-full rounded-control border border-input bg-surface pr-9 pl-3 text-body text-ink outline-none transition-[border-color,box-shadow] duration-(--duration-fast) ease-ledger placeholder:text-ink-muted hover:border-ink-muted/60 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-ink/10"
        />
        <ComboboxPrimitive.Trigger className="absolute inset-y-0 right-0 grid w-9 place-items-center text-ink-muted" aria-label="Show options">
          <ChevronsUpDown className="size-4" aria-hidden="true" />
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={6} className="z-50 outline-none">
          <ComboboxPrimitive.Popup className="max-h-72 w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-control border border-rule bg-surface p-1 text-body shadow-float transition-[opacity,scale] duration-(--duration-fast) ease-ledger data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <ComboboxPrimitive.Empty className="px-2.5 py-2 text-small text-ink-muted empty:hidden">{emptyText}</ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="flex cursor-default items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-ink outline-none select-none data-highlighted:bg-tint"
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.hint ? <span className="num text-caption text-ink-muted">{option.hint}</span> : null}
                  <ComboboxPrimitive.ItemIndicator>
                    <Check className="size-4" aria-hidden="true" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
