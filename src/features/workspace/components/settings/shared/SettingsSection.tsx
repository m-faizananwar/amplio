import type { ReactNode } from "react";

type Props = { id: string; title: string; description?: ReactNode; children: ReactNode; tone?: "default" | "danger" };

// One settings section: a heading the index links to, a line on what it
// changes, then its own form. Sections save separately, so an error in one
// never blocks another.
export function SettingsSection({ id, title, description, children, tone = "default" }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 rounded-card border bg-surface p-5 sm:p-6 ${tone === "danger" ? "border-failure/40" : "border-rule"}`}>
      <h2 id={`${id}-title`} className="text-h4">{title}</h2>
      {description ? <p className="mt-1 text-small text-ink-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
