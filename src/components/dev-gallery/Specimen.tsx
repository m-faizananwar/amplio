import type { ReactNode } from "react"

// Gallery layout only: a titled section, and a labelled row of specimens.
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-rule py-10 first:border-t-0">
      <h2 className="text-h4">{title}</h2>
      <div className="mt-6 grid gap-8">{children}</div>
    </section>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:items-start">
      <p className="num pt-2 text-caption text-ink-muted">{label}</p>
      <div className="flex min-w-0 flex-wrap items-start gap-3">{children}</div>
    </div>
  )
}
