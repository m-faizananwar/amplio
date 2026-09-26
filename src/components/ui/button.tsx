import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

// Buttons (docs/design/DIRECTION.md, "Buttons"). Every real action is a blob
// button (src/styles/blob-button.css): primary (ink), money (pay, top up,
// release, withdraw), quiet (secondary), danger (irreversible; ConfirmButton's
// armed step). Ghost, link and the icon sizes stay plain: they sit in rows and
// toolbars where a pill would shout; chip is a filter trigger. Old names are aliases: default → primary,
// secondary / outline / glass → quiet, destructive → danger.
const BLOB = {
  primary: "primary",
  default: "primary",
  money: "money",
  secondary: "quiet",
  outline: "quiet",
  glass: "quiet",
  quiet: "quiet",
  danger: "danger",
  destructive: "danger",
} as const

const plain = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,transform,opacity] duration-(--duration-fast) ease-ledger focus-visible:ring-2 focus-visible:ring-money active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-ink/85",
        money: "bg-money text-surface hover:bg-money/90",
        quiet: "border-rule-strong bg-surface text-ink hover:bg-well aria-expanded:bg-well",
        ghost: "text-ink hover:bg-well aria-expanded:bg-well",
        danger: "border-failure/30 bg-surface text-failure hover:bg-failure-soft",
        link: "h-auto px-0 text-info underline-offset-4 hover:underline",
        // filter triggers and toggles: a pill, not an action
        chip: "rounded-chip border-rule-strong bg-surface text-ink hover:bg-well aria-expanded:bg-well data-popup-open:bg-well",
        // the landing keeps its own flat buttons (this round leaves it alone)
        solid: "rounded-chip bg-ink text-paper hover:bg-ink/85",
        line: "rounded-chip border-rule-strong bg-surface text-ink hover:bg-well",
      },
      size: {
        default: "h-10 gap-2 px-4 text-body",
        sm: "h-8 gap-1.5 px-3 text-small",
        xs: "h-7 gap-1 px-2 text-caption [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-body",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

type Plain = "ghost" | "link" | "chip" | "solid" | "line"
type Variant = keyof typeof BLOB | Plain
type Size = NonNullable<VariantProps<typeof plain>["size"]>
type VariantOptions = { variant?: Variant | null; size?: Size | null; className?: string }

const blobTone = (variant: Variant, size: Size) =>
  size.startsWith("icon") ? null : variant in BLOB ? BLOB[variant as keyof typeof BLOB] : null
const plainVariant = (variant: Variant) =>
  variant in BLOB ? BLOB[variant as keyof typeof BLOB] : (variant as Plain)

// Class names only, for a Link that should look like a button: the pill and
// its border, filled flat on hover (a link has no blob markup inside).
function buttonVariants({ variant = "primary", size = "default", className }: VariantOptions = {}) {
  const v = variant ?? "primary"
  const s = size ?? "default"
  const tone = blobTone(v, s)
  if (tone) return cn("blob-btn", `blob-btn--${tone}`, (s === "sm" || s === "xs") && "blob-btn--sm", className)
  return cn(plain({ variant: plainVariant(v), size: s }), className)
}

type ButtonProps = Omit<ButtonPrimitive.Props, "className"> & {
  className?: string
  variant?: Variant
  size?: Size
  /** A round filled disc at the start that turns 90° on hover. */
  icon?: ReactNode
  /** A save in flight: the pill shrinks into a spinner, then shows a check or shakes. */
  status?: "saving" | "saved" | "error"
}

function Button({ className, variant = "primary", size = "default", icon, status, children, ...props }: ButtonProps) {
  const tone = blobTone(variant, size)
  if (!tone) {
    return <ButtonPrimitive data-slot="button" className={buttonVariants({ variant, size, className })} {...props}>{children}</ButtonPrimitive>
  }
  return (
    <ButtonPrimitive data-slot="button" data-variant={tone} data-state={status} aria-busy={status === "saving" || undefined} className={buttonVariants({ variant, size, className })} {...props}>
      {icon ? <span className="blob-btn__icon" aria-hidden="true">{icon}</span> : null}
      <span className="blob-btn__label">{children}</span>
      {status ? <SaveStatus status={status} /> : null}
      <span className="blob-btn__inner" aria-hidden="true">
        <span className="blob-btn__blobs">
          <span className="blob-btn__blob" /><span className="blob-btn__blob" /><span className="blob-btn__blob" /><span className="blob-btn__blob" />
        </span>
      </span>
    </ButtonPrimitive>
  )
}

// Drawn over the label while saving: a turning arc, then a check that draws in.
function SaveStatus({ status }: { status: "saving" | "saved" | "error" }) {
  if (status === "error") return null
  return (
    <span className="blob-btn__status" aria-hidden="true">
      {status === "saving" ? (
        <svg viewBox="0 0 24 24" className="blob-btn__spinner"><circle cx="12" cy="12" r="9" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="blob-btn__check"><path d="M6 12.5l4 4 8-9" /></svg>
      )}
    </span>
  )
}

// The goo filter the blobs merge through, mounted once in the root layout.
function GooFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in2="goo" in="SourceGraphic" result="mix" />
        </filter>
      </defs>
    </svg>
  )
}

export { Button, buttonVariants, GooFilter, type ButtonProps }
