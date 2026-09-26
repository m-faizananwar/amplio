"use client"

import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"
import { cn } from "@/lib/cn"
import { hasBracketedExample } from "@/lib/placeholders"

type TextareaProps = Omit<React.ComponentProps<"textarea">, "maxLength"> & {
  /** Shows a count; it turns amber within 10% of the limit and red past it (the schema enforces it). */
  maxLength?: number
  /** Rows before it grows: `rows` if given, else 3 (a chat composer passes 1). */
  minRows?: number
}

const NEAR = 0.9
const supportsFieldSizing = () => typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")

// Where field-sizing isn't supported, size the box to its text by hand (the
// max-height in CSS still caps it, after which it scrolls).
function grow(box: HTMLTextAreaElement) {
  if (supportsFieldSizing()) return
  box.style.height = "auto"
  box.style.height = `${box.scrollHeight + 2}px`
}

// The one multi-line field (DIRECTION.md, "Text fields"): a white box, radius
// 22, that grows with its text up to ~14 rows, a light beam circling its
// border while focused, a count when there is a limit, and a warning while
// [bracketed] example text is still in it. The finish is src/styles/fields.css.
function Textarea({ className, maxLength, minRows, onChange, ...props }: TextareaProps) {
  const rows = minRows ?? (typeof props.rows === "number" ? props.rows : 3)
  const t = useTranslations("common.textField")
  const shell = React.useRef<HTMLSpanElement>(null)
  const [text, setText] = React.useState(() => String(props.value ?? props.defaultValue ?? ""))
  const shown = props.value !== undefined ? String(props.value) : text
  // A form library may write the value into the box after mount (and on
  // reset); read what is really there, and keep reading it on input.
  React.useEffect(() => {
    const box = shell.current?.querySelector("textarea")
    if (!box) return
    const read = () => { setText(box.value); grow(box) }
    const frame = requestAnimationFrame(read)
    box.form?.addEventListener("reset", () => requestAnimationFrame(read))
    return () => cancelAnimationFrame(frame)
  }, [])
  const level = maxLength ? (shown.length > maxLength ? "over" : shown.length >= maxLength * NEAR ? "near" : "ok") : null
  return (
    <span className="desc-field">
      <span ref={shell} className="desc-shell" data-count={level ? "" : undefined}>
        <textarea
          data-slot="textarea"
          {...props}
          style={{ ...props.style, "--desc-rows": rows } as React.CSSProperties}
          className={cn("desc-box", className)}
          onChange={(event) => {
            setText(event.target.value)
            grow(event.target)
            onChange?.(event)
          }}
        />
        {maxLength ? (
          <span className="desc-count" data-level={level}>
            <span aria-hidden="true">{shown.length}/{maxLength}</span>
            <span className="sr-only">{t("count", { count: shown.length, max: maxLength })}</span>
          </span>
        ) : null}
      </span>
      {hasBracketedExample(shown) ? (
        <span className="desc-warning" role="status"><AlertTriangle aria-hidden="true" />{t("brackets")}</span>
      ) : null}
    </span>
  )
}

export { Textarea, type TextareaProps }
