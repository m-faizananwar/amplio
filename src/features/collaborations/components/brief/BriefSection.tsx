import type { ReactNode } from "react";

export function BriefSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2 border-b border-rule px-5 py-4 last:border-b-0">
      <h3 className="text-small font-medium text-ink-muted">{title}</h3>
      <div className="grid gap-2 text-body text-ink">{children}</div>
    </section>
  );
}
