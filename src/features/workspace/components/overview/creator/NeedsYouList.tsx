import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { NeedsYouRow } from "./needs-you-rows";
import { JoiningDotsScene } from "@/components/graphics/scenes";
import { StatusGlyph } from "@/components/graphics/StatusGlyph";
import { ClearedBurst } from "./ClearedBurst";

type Labels = { title: string; emptyTitle: string; emptyBody: string; emptyAction: string };

// The first thing on the creator's Overview: what is waiting on them, most
// urgent first, one line and one button each, each with its state's glyph.
// Ruled like a ledger; anything cleared since the last visit gets a burst.
export function NeedsYouList({ rows, labels }: { rows: NeedsYouRow[]; labels: Labels }) {
  const marks = rows.map((r) => `${r.key}:${r.glyph}`);
  if (rows.length === 0) {
    return (
      <div className="relative">
      <ClearedBurst marks={marks} />
      <EmptyState
        illustration={<JoiningDotsScene />}
        title={labels.emptyTitle}
        body={labels.emptyBody}
        action={<Link href="/creator/opportunities" className={buttonVariants()}>{labels.emptyAction}</Link>}
      />
      </div>
    );
  }
  return (
    <section aria-labelledby="needs-you" className="relative rounded-card border border-rule bg-surface">
      <ClearedBurst marks={marks} />
      <h2 id="needs-you" className="sr-only">{labels.title}</h2>
      <ol className="list-stagger divide-y divide-rule">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <StatusGlyph key={row.glyph} status={row.glyph} className="hidden size-5 text-attention sm:block" />
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
