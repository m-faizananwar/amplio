import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Ledger buttons (docs/design/DIRECTION.md): primary is ink on paper, secondary
// is an outline, ghost is text until hovered, danger is failure-red and — for
// anything irreversible — goes through ConfirmButton's second click.
// `default`, `outline`, `destructive` and `glass` are the old names, kept as
// aliases so existing screens restyle without a rewrite.
const primary = "bg-ink text-paper hover:bg-ink/85"
const secondary = "border-rule-strong bg-surface text-ink hover:bg-tint aria-expanded:bg-tint"
const danger = "border-failure/30 bg-surface text-failure hover:bg-failure-soft focus-visible:ring-failure/25"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,transform,opacity] duration-(--duration-fast) ease-ledger focus-visible:ring-3 focus-visible:ring-ink/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-failure [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary,
        secondary,
        ghost: "text-ink hover:bg-tint aria-expanded:bg-tint",
        danger,
        link: "h-auto px-0 text-info underline-offset-4 hover:underline",
        default: primary,
        outline: secondary,
        glass: secondary,
        destructive: danger,
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-body",
        sm: "h-8 gap-1.5 px-3 text-small",
        xs: "h-7 gap-1 px-2 text-caption [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-body",
        icon: "size-9",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
