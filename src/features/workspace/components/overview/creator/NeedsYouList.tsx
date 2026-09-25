import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { NeedsYouRow } from "./needs-you-rows";
import { JoiningDotsScene } from "@/components/graphics/scenes";

type Labels = { title: string; emptyTitle: string; emptyBody: string; emptyAction: string };

// The first thing on the creator's Overview: what is waiting on them, most
// urgent first, one line and one button each. Ruled like a ledger.
export function NeedsYouList({ rows, labels }: { rows: NeedsYouRow[]; labels: Labels }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        illustration={<JoiningDotsScene />}
        title={labels.emptyTitle}
        body={labels.emptyBody}
        action={<Link href="/creator/opportunities" className={buttonVariants()}>{labels.emptyAction}</Link>}
      />
    );
  }
  return (
    <section aria-labelledby="needs-you" className="rounded-card border border-rule bg-surface">
      <h2 id="needs-you" className="sr-only">{labels.title}</h2>
      <ol className="list-stagger divide-y divide-rule">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="hidden size-2 shrink-0 rounded-chip bg-attention sm:block" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{row.title}</p>
              <p className="truncate text-small text-ink-muted">{row.detail}</p>
            </div>
            <Link href={row.href} className={buttonVariants({ variant: index === 0 ? "primary" : "secondary", className: "self-start sm:self-auto" })}>
              {row.cta}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
