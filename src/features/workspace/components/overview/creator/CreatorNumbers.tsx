import Link from "next/link";

export type CreatorNumber = { key: string; label: string; value: string; note: string; href: string };

// Three numbers under Needs you. Each one leads to the rows it is made of.
export function CreatorNumbers({ numbers }: { numbers: CreatorNumber[] }) {
  return (
    <section aria-label="Your numbers" className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule sm:grid-cols-3">
      {numbers.map((n) => (
        <Link key={n.key} href={n.href} className="group bg-surface p-5 transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint focus-visible:outline-2 focus-visible:outline-ink">
          <p className="text-small text-ink-muted">{n.label}</p>
          <p className="num mt-2 text-h2 text-ink">{n.value}</p>
          <p className="mt-1 text-caption text-ink-muted group-hover:text-ink">{n.note}</p>
        </Link>
      ))}
    </section>
  );
}
