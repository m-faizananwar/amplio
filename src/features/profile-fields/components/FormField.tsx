import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

type Props = { id: string; label: ReactNode; context?: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; className?: string };

// Label, control, then either the hint or the error — the layout every field
// in onboarding and settings shares (the /dev/ui field pattern).
export function FormField({ id, label, context, hint, error, children, className }: Props) {
  return (
    <div data-slot="field" className={className ? `grid gap-1.5 ${className}` : "grid gap-1.5"}>
      <label htmlFor={id} className="field-label">{label}</label>
      {context ? <p id={`${id}-context`} className="field-context">{context}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="field-error"><AlertCircle aria-hidden="true" />{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint text-caption text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}
