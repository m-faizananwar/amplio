import type { ReactNode } from "react";

type Props = { eyebrow: string; title: string; sub?: string; children?: ReactNode };

// The calm pages' opening: eyebrow, a 48–64px headline, one sentence, and
// the page's actions. Paper, a hairline under it, nothing moving but the
// page's own fade-up.
export function PublicHero({ eyebrow, title, sub, children }: Props) {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-content animate-rise px-4 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
        <p className="text-small text-ink-muted">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-[clamp(40px,6vw,64px)] leading-[1.02] tracking-[-0.035em]">{title}</h1>
        {sub ? <p className="mt-5 max-w-2xl text-lead text-ink-muted">{sub}</p> : null}
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
