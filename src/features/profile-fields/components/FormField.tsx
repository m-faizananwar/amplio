import type { ReactNode } from "react";

type Props = { id: string; label: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; className?: string };

// Label, control, then either the hint or the error — the layout every field
// in onboarding and settings shares (the /dev/ui field pattern).
export function FormField({ id, label, hint, error, children, className }: Props) {
  return (
    <div className={className ? `grid gap-1.5 ${className}` : "grid gap-1.5"}>
      <label htmlFor={id} className="text-small font-medium text-ink">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-failure">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}
