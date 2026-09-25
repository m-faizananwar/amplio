import type { ReactNode } from "react";

// A results section: heading, one line on what it shows, an action on the right.
export function Section({ id, title, description, action, children }: { id: string; title: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="text-h4">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-small text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
