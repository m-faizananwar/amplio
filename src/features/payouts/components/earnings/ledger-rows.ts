import type { TrailRow } from "@/components/trail/types";
import type { LedgerRowDto } from "../../schemas";

export type MethodLabels = { bank: string; stripe: string };

// "Payout · OrbiSearch" → "OrbiSearch": the type is shown (translated) on its
// own. A withdrawal's stored description is English ("Withdrawal · Bank
// transfer"), so its detail is the method in the viewer's language instead.
export function ledgerDetail(r: LedgerRowDto, methods: MethodLabels) {
  if (r.type === "withdrawal") return /stripe/i.test(r.description) ? methods.stripe : methods.bank;
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
export function earningsTrail(rows: LedgerRowDto[], typeLabel: (r: LedgerRowDto) => string, methods: MethodLabels) {
  const toRow = (r: LedgerRowDto): TrailRow => ({ id: r.id, at: r.date, title: ledgerDetail(r, methods), detail: `${typeLabel(r)} · ${r.reference}`, amountCents: r.amountCents });
  const released = rows.filter((r) => r.type === "payout" && r.status === "completed");
  const withdrawals = rows.filter((r) => r.type === "withdrawal");
  return {
    earned: released.map(toRow),
    awaiting: rows.filter((r) => r.type === "payout" && r.status === "pending").map(toRow),
    withdrawn: withdrawals.map(toRow),
    available: [...released, ...withdrawals].sort((a, b) => (a.date < b.date ? 1 : -1)).map(toRow),
  };
}
