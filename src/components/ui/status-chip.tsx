import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import type { CollaborationStatus } from "@/lib/collaboration-status"

// A status is a small pill with a dot. Colour carries meaning, never decoration:
// attention = waiting on someone, money = live/paid (verified), failure =
// declined, neutral = everything in motion that needs no one right now.
const chipVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-chip px-2.5 text-caption font-medium whitespace-nowrap before:size-1.5 before:rounded-full before:bg-current",
  {
    variants: {
      tone: {
        neutral: "bg-tint text-ink-muted",
        attention: "bg-attention-soft text-attention",
        money: "bg-money-soft text-money",
        failure: "bg-failure-soft text-failure",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export type ChipTone = NonNullable<VariantProps<typeof chipVariants>["tone"]>

const STATUS_TONE: Record<CollaborationStatus, ChipTone> = {
  invited: "attention",
  applied: "attention",
  draft_submitted: "attention",
  changes_requested: "attention",
  accepted: "neutral",
  approved: "neutral",
  scheduled: "neutral",
  live: "money",
  paid: "money",
  declined: "failure",
}

export function statusTone(status: CollaborationStatus): ChipTone {
  return STATUS_TONE[status]
}

type Props = React.ComponentProps<"span"> & VariantProps<typeof chipVariants>

export function StatusChip({ tone, className, ...props }: Props) {
  return <span data-slot="status-chip" data-tone={tone ?? "neutral"} className={cn(chipVariants({ tone }), className)} {...props} />
}
