"use client"

import { useTheme } from "@/components/shell/theme/useTheme"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolved } = useTheme()

  return (
    <Sonner
      theme={resolved}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-money" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-attention" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-failure" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--rule)",
          "--border-radius": "var(--radius-control)",
          "--toast-ms": `${props.duration ?? 4000}ms`,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !font-sans !text-body !shadow-float",
          description: "!text-ink-muted !text-small",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
