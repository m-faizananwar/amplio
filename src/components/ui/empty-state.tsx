import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "cn"

type Props = {
  icon?: LucideIcon
  title: ReactNode
  /** Say what to do next, not that there is nothing here. */
  body?: ReactNode
  /** The button for that next step. */
  action?: ReactNode
  className?: string
  size?: "default" | "compact"
}

// Every empty list says the next step and carries the button for it
// (DECISIONS.md: "Empty states always say the next step").
export function EmptyState({ icon: Icon, title, body, action, className, size = "default" }: Props) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-rule-strong bg-surface text-center animate-rise",
        size === "compact" ? "px-4 py-8" : "px-6 py-14",
        className
      )}
    >
      {Icon ? (
        <span className="grid size-10 place-items-center rounded-full border border-rule bg-paper text-ink-muted" aria-hidden="true">
          <Icon className="size-4.5" />
        </span>
      ) : null}
      <div className="max-w-sm">
        <p className="text-lead font-semibold tracking-(--tracking-heading) text-ink">{title}</p>
        {body ? <p className="mt-1 text-body text-ink-muted">{body}</p> : null}
      </div>
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}
