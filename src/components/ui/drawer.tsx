"use client"

import { Dialog as DrawerPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"
import { Button } from "./button"

// A right-hand panel for detail that belongs to the page you are on: the trail
// behind a number, a creator's fit signals, a row's history. Slides 24px and
// fades (transform + opacity only); full width below 640px.

function Drawer(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerClose = DrawerPrimitive.Close

type ContentProps = Omit<DrawerPrimitive.Popup.Props, "title"> & {
  heading: ReactNode
  description?: ReactNode
  footer?: ReactNode
  closeLabel?: string
  width?: "default" | "wide"
}

function DrawerContent({ heading, description, footer, closeLabel = "Close", width = "default", className, children, ...props }: ContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-ink/15 transition-opacity duration-(--duration-base) ease-ledger data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DrawerPrimitive.Popup
        data-slot="drawer-content"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-rule bg-surface text-ink shadow-float outline-none transition-[opacity,translate] duration-(--duration-slow) ease-ledger data-ending-style:translate-x-6 data-ending-style:opacity-0 data-starting-style:translate-x-6 data-starting-style:opacity-0 motion-reduce:transition-none",
          width === "wide" ? "sm:max-w-2xl" : "sm:max-w-md",
          className
        )}
        {...props}
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
          <div className="min-w-0">
            <DrawerPrimitive.Title className="text-lead font-semibold tracking-(--tracking-heading)">{heading}</DrawerPrimitive.Title>
            {description ? <DrawerPrimitive.Description className="mt-0.5 text-small text-ink-muted">{description}</DrawerPrimitive.Description> : null}
          </div>
          <DrawerPrimitive.Close render={<Button variant="ghost" size="icon-sm" className="-mr-1.5 -mt-1" />}>
            <XIcon aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </DrawerPrimitive.Close>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? <footer className="flex items-center justify-end gap-2 border-t border-rule px-5 py-3">{footer}</footer> : null}
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Portal>
  )
}

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent }
