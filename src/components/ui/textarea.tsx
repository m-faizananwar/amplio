import * as React from "react"
import { cn } from "@/lib/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 py-2 leading-relaxed w-full min-w-0 rounded-control border border-input bg-surface px-3 text-body text-ink transition-[border-color,box-shadow] duration-(--duration-fast) ease-ledger outline-none placeholder:text-ink-muted hover:border-ink-muted/60 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-ink/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-tint disabled:opacity-60 aria-invalid:border-failure aria-invalid:ring-3 aria-invalid:ring-failure/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
