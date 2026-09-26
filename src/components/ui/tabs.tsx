"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

// Tabs with a sliding indicator (Base UI measures the active tab into
// --active-tab-* vars; we only animate transform/width on the indicator).
// `line` is the default ledger look: text tabs on a hairline, ink underline.
// `pill` is a segmented surface for short, local switches. `default` is the
// old name for pill.

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-4 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva("group/tabs-list relative inline-flex w-fit items-center text-ink-muted", {
  variants: {
    variant: {
      line: "gap-5 border-b border-rule",
      pill: "gap-0.5 rounded-control bg-tint p-0.5",
      default: "gap-0.5 rounded-control bg-tint p-0.5",
    },
  },
  defaultVariants: { variant: "line" },
})

function TabsList({
  className,
  variant = "line",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const line = variant === "line"
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        className={cn(
          "inchworm absolute",
          line
            ? "-bottom-px h-0.5 bg-ink"
            : "top-0.5 z-0 h-(--active-tab-height) rounded-[calc(var(--radius-control)-2px)] bg-surface shadow-[0_1px_2px_rgb(17_17_17/0.08)]"
        )}
      />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inchworm-label relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-body font-medium outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-money disabled:pointer-events-none disabled:opacity-45 data-active:text-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:px-0",
        "group-data-[variant=pill]/tabs-list:h-8 group-data-[variant=pill]/tabs-list:rounded-[calc(var(--radius-control)-2px)] group-data-[variant=pill]/tabs-list:px-3",
        "group-data-[variant=default]/tabs-list:h-8 group-data-[variant=default]/tabs-list:rounded-[calc(var(--radius-control)-2px)] group-data-[variant=default]/tabs-list:px-3",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-body outline-none data-[hidden]:hidden animate-rise", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
