import type { TrailRow } from "@/components/trail/types";
import type { LedgerRowDto } from "../../schemas";

// "Payout · OrbiSearch" → "OrbiSearch": the type is shown (translated) on its own.
export function ledgerDetail(r: LedgerRowDto) {
  const parts = r.description.split(" · ");
  return parts.length > 1 ? parts.slice(1).join(" · ") : r.description;
}

export type LedgerView = "all" | "awaiting" | "payments";

export function ledgerFilter(rows: LedgerRowDto[], view: LedgerView) {
  if (view === "awaiting") return rows.filter((r) => r.type === "payout" && r.status === "pending");
  if (view === "payments") return rows.filter((r) => r.type === "payout" && r.status === "completed");
  return rows;
}

// The rows behind each earnings number — they add up to it.
export function earningsTrail(rows: LedgerRowDto[], typeLabel: (r: LedgerRowDto) => string) {
  const toRow = (r: LedgerRowDto): TrailRow => ({ id: r.id, at: r.date, title: ledgerDetail(r), detail: `${typeLabel(r)} · ${r.reference}`, amountCents: r.amountCents });
  const released = rows.filter((r) => r.type === "payout" && r.status === "completed");
  const withdrawals = rows.filter((r) => r.type === "withdrawal");
  return {
    earned: released.map(toRow),
    awaiting: rows.filter((r) => r.type === "payout" && r.status === "pending").map(toRow),
    withdrawn: withdrawals.map(toRow),
    available: [...released, ...withdrawals].sort((a, b) => (a.date < b.date ? 1 : -1)).map(toRow),
  };
}
