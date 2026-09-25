import type { ReactNode } from "react";

type Props = { title: string; description?: string; children: ReactNode };

// The "what to do now" box on the collaboration page: one per allowed action.
export function ActionPanel({ title, description, children }: Props) {
  return (
    <section className="rounded-card border border-attention/40 bg-surface p-5 animate-rise">
      <h2 className="flex items-center gap-2 text-lead font-semibold">
        <span aria-hidden="true" className="size-2 rounded-chip bg-attention" />
        {title}
      </h2>
      {description ? <p className="mt-1 text-small text-ink-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// When it's the other side's move: one quiet line saying what happens next.
export function WaitingNote({ text }: { text: string }) {
  return <p className="rounded-card border border-rule bg-surface px-5 py-4 text-small text-ink-muted">{text}</p>;
}
