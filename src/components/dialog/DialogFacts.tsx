import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Fact = { label: string; value: ReactNode; mono?: boolean; tone?: "money" | "attention" };

// The facts a decision rests on, as a ruled list: who, how much, which post,
// when. Amounts and dates set in mono so they line up and read as figures.
export function DialogFacts({ facts }: { facts: Fact[] }) {
  if (facts.length === 0) return null;
  return (
    <dl className="divide-y divide-rule rounded-control border border-rule bg-paper text-small">
      {facts.map((f) => (
        <div key={f.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
          <dt className="shrink-0 text-ink-muted">{f.label}</dt>
          <dd className={cn("min-w-0 truncate text-right text-ink", f.mono && "num", f.tone === "money" && "text-money", f.tone === "attention" && "text-attention")}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
