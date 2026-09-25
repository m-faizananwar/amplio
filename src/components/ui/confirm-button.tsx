"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "./button"

type Props = {
  children: ReactNode
  /** Label while armed, e.g. "Delete campaign — are you sure?" */
  confirmLabel: ReactNode
  onConfirm: () => void | Promise<void>
  disabled?: boolean
  size?: "default" | "sm" | "xs" | "lg"
  className?: string
}

const DISARM_MS = 4000

// Destructive actions take two clicks: the first arms the button and says what
// will happen, the second does it. It disarms itself after 4 s, on blur and on
// Escape, so an accidental first click never lingers as a loaded trigger.
export function ConfirmButton({ children, confirmLabel, onConfirm, disabled, size = "default", className }: Props) {
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function arm() {
    setArmed(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setArmed(false), DISARM_MS)
  }

  async function click() {
    if (!armed) return arm()
    window.clearTimeout(timer.current)
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
      setArmed(false)
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      className={className}
      disabled={disabled || busy}
      aria-live="polite"
      data-armed={armed || undefined}
      onClick={click}
      onBlur={() => setArmed(false)}
      onKeyDown={(e) => { if (e.key === "Escape") setArmed(false) }}
    >
      {armed ? confirmLabel : children}
    </Button>
  )
}
