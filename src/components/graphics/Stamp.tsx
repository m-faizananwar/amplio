import type { ReactNode } from "react";

// A ledger row "prints" in with a stamp: the label lands slightly rotated,
// scaling down onto the row once. Money tone for PAID, ink for APPROVED.
export function Stamp({ children, tone = "money" }: { children: ReactNode; tone?: "money" | "ink" }) {
  return (
    <span className={`g-stamp inline-flex -rotate-6 items-center rounded-control border-2 px-1.5 py-0.5 text-caption font-semibold uppercase tracking-wide ${tone === "money" ? "border-money text-money" : "border-ink text-ink"}`}>
      {children}
    </span>
  );
}
