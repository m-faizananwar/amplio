import type { ReactNode } from "react";

type Props = { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode };

// Every app page opens the same way: what this page is, one line on what it's
// for, and the page's primary action on the right. The heading's entrance
// (word by word) comes from RouteEnter, which marks the first h1 it finds.
export function PageHeader({ title, description, actions, eyebrow }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-caption text-ink-muted">{eyebrow}</p> : null}
        <h1 className="text-h3 text-ink sm:text-h2">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-body text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
