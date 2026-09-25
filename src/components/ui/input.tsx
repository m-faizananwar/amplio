import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 py-1.5 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-small file:font-medium file:text-ink w-full min-w-0 rounded-control border border-input bg-surface px-3 text-body text-ink transition-[border-color,box-shadow] duration-(--duration-fast) ease-ledger outline-none placeholder:text-ink-muted hover:border-ink-muted/60 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-ink/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-tint disabled:opacity-60 aria-invalid:border-failure aria-invalid:ring-3 aria-invalid:ring-failure/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
