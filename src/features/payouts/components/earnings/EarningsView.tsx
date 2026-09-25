"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import type { LedgerRowDto } from "../../schemas";
import type { EarningsSummary, MonthPoint } from "../../server/queries";
import { CreatorLedger } from "./CreatorLedger";
import { EarningsChart } from "./EarningsChart";
import { earningsTrail } from "./ledger-rows";
import { type PayoutOnFile, WithdrawDialog } from "./WithdrawDialog";

type Props = { summary: EarningsSummary; months: MonthPoint[]; ledger: LedgerRowDto[]; payout: PayoutOnFile; openWithdraw: boolean };
type Key = "available" | "awaiting" | "withdrawn" | "earned";
const CENTS = 100;

// Four money numbers that open their ledger rows, the months, the ledger,
// and the one action: withdraw what's available.
export function EarningsView({ summary: s, months, ledger, payout, openWithdraw }: Props) {
  const t = useTranslations("creator.earnings");
  const tt = useTranslations("creator.trail");
  const format = useFormatter();
  const [withdrawing, setWithdrawing] = useState(openWithdraw && s.availableCents > 0);
  const [open, setOpen] = useState<Key | null>(null);
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const trail = earningsTrail(ledger, (r) => t(`ledger.types.${r.type}`));
  const cards: Array<{ key: Key; label: string; hint: string; value: number; rows: TrailRow[] }> = [
    { key: "available", label: t("stats.available.label"), hint: t("stats.available.hint"), value: s.availableCents, rows: trail.available },
    { key: "awaiting", label: t("stats.awaitingRelease.label"), hint: t("stats.awaitingRelease.hint", { count: s.awaitingReleaseCount }), value: s.awaitingReleaseCents, rows: trail.awaiting },
    { key: "withdrawn", label: t("stats.withdrawn.label"), hint: t("stats.withdrawn.hint"), value: s.withdrawnCents, rows: trail.withdrawn },
    { key: "earned", label: t("stats.earned.label"), hint: t("stats.earned.hint"), value: s.totalEarnedCents, rows: trail.earned },
  ];
  const active = cards.find((c) => c.key === open);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => setWithdrawing(true)} disabled={s.availableCents <= 0}>{t("withdraw.button")}</Button>
        {s.availableCents <= 0 ? <p className="text-small text-ink-muted">{t("withdraw.disabledReason")}</p> : null}
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("title")}>
        {cards.map((c) => <StatCard key={c.key} label={c.label} hint={c.hint} value={c.value} format={money} tone={c.key === "available" ? "money" : "ink"} openLabel={t("stats.openTrail")} onOpen={() => setOpen(c.key)} />)}
      </section>
      <EarningsChart months={months} />
      <CreatorLedger rows={ledger} />
      <TrailDrawer open={active !== undefined} onOpenChange={(v) => !v && setOpen(null)} title={active ? tt("title", { metric: active.label, count: active.rows.length }) : ""} total={active ? money(active.value) : ""} rows={active?.rows ?? []} emptyText={tt("empty.body")} formatAmount={money}
        formatTime={(iso) => format.dateTime(new Date(iso), { dateStyle: "medium" })} />
      <WithdrawDialog open={withdrawing} onOpenChange={setWithdrawing} availableCents={s.availableCents} awaitingReleaseCents={s.awaitingReleaseCents} payout={payout} />
    </div>
  );
}
