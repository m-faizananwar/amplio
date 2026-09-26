"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/cn"

type InputProps = React.ComponentProps<"input"> & {
  /** A glyph in a rounded square at the start; an accent square pops in behind it once the field has a value or focus. */
  leadingIcon?: React.ReactNode
}

const FILE = "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-small file:font-medium file:text-ink"

// The field finish (well, focus lift, invalid ring) is in src/styles/fields.css.
function Input({ className, type, leadingIcon, ...props }: InputProps) {
  if (leadingIcon) return <IconInput className={className} type={type} leadingIcon={leadingIcon} {...props} />
  return <InputPrimitive type={type} data-slot="input" className={cn("field-control", FILE, className)} {...props} />
}

function IconInput({ className, type, leadingIcon, onChange, ...props }: InputProps) {
  const [filled, setFilled] = React.useState(() => String(props.value ?? props.defaultValue ?? "").length > 0)
  const shown = props.value !== undefined ? String(props.value).length > 0 : filled
  return (
    <span className="field-shell" data-filled={shown}>
      <span className="field-icon" aria-hidden="true">{leadingIcon}</span>
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn("field-control", FILE, className)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFilled(event.target.value.length > 0)
          onChange?.(event)
        }}
        {...props}
      />
    </span>
  )
}

export { Input, type InputProps }
