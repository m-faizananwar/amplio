import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { NeedsYouRow } from "./needs-you-rows";

// The first thing on the creator's Overview: what is waiting on them, most
// urgent first, one line and one button each. Ruled like a ledger.
export function NeedsYouList({ rows }: { rows: NeedsYouRow[] }) {
  if (rows.length === 0) {
    return (
      <section aria-labelledby="needs-you" className="rounded-card border border-rule bg-surface p-6">
        <h2 id="needs-you" className="text-h4">Nothing needs you right now</h2>
        <p className="mt-1 text-ink-muted">New invitations and brand replies show up here. Meanwhile, open campaigns are waiting for applications.</p>
        <Link href="/creator/opportunities" className={buttonVariants({ className: "mt-4" })}>Browse opportunities</Link>
      </section>
    );
  }
  return (
    <section aria-labelledby="needs-you" className="rounded-card border border-rule bg-surface">
      <h2 id="needs-you" className="sr-only">Needs you</h2>
      <ol className="divide-y divide-rule">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="hidden size-2 shrink-0 rounded-chip bg-attention sm:block" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{row.title}</p>
              <p className="truncate text-small text-ink-muted">{row.detail}</p>
            </div>
            <Link href={row.href} className={buttonVariants({ variant: index === 0 ? "default" : "outline", className: "self-start sm:self-auto" })}>
              {row.cta}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
