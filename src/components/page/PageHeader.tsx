import type { ReactNode } from "react";
import { WordReveal } from "@/components/motion/WordReveal";

type Props = { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode };

// Every app page opens the same way: what this page is, one line on what it's
// for, and the page's primary action on the right. A plain-text title lands
// word by word (WordReveal); anything richer renders as given.
export function PageHeader({ title, description, actions, eyebrow }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-caption text-ink-muted">{eyebrow}</p> : null}
        {typeof title === "string" ? (
          <h1 className="text-h3 text-ink sm:text-h2" aria-label={title}><WordReveal text={title} /></h1>
        ) : (
          <h1 className="text-h3 text-ink sm:text-h2">{title}</h1>
        )}
        {description ? <p className="mt-2 max-w-2xl text-body text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
