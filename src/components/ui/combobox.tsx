"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Check, ChevronDown } from "lucide-react"
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
          className="field-control pr-12"
        />
        <ComboboxPrimitive.Trigger className="group/cb absolute inset-y-0 right-3.5 flex items-center" aria-label="Show options">
          <span className="field-chevron group-data-[popup-open]/cb:rotate-180"><ChevronDown aria-hidden="true" /></span>
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={6} className="dd-pos z-50 outline-none">
          <ComboboxPrimitive.Popup className="dd-panel max-h-72 w-(--anchor-width) overflow-y-auto p-1.5 text-body">
            <ComboboxPrimitive.Empty className="px-2.5 py-2 text-small text-ink-muted empty:hidden">{emptyText}</ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="dropdown-option"
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.hint ? <span className="num text-caption text-ink-muted">{option.hint}</span> : null}
                  <ComboboxPrimitive.ItemIndicator>
                    <Check className="dropdown-check" aria-hidden="true" />
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
