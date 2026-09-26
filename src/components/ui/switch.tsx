"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/cn"

// 36×22 inset track, a 16px white thumb that springs 16px; on is the accent
// (src/styles/fields.css). `size` is kept for old callers; there is one size.
function Switch({ className, size: _size, ...props }: SwitchPrimitive.Root.Props & { size?: "sm" | "default" }) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn("switch-track peer", className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="switch-thumb" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
