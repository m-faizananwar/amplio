"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { TrailDrawer } from "@/components/trail/TrailDrawer";
import type { TrailRow } from "@/components/trail/types";
import type { LedgerRowDto } from "../../schemas";
import type { EarningsSummary, MonthPoint } from "../../server/queries";
import { CreatorLedger } from "./CreatorLedger";
import { BalanceCard, type BalanceKey } from "./BalanceCard";
import { earningsTrail } from "./ledger-rows";
import { type PayoutOnFile, WithdrawDialog } from "./WithdrawDialog";

type Props = { summary: EarningsSummary; months: MonthPoint[]; ledger: LedgerRowDto[]; payout: PayoutOnFile; openWithdraw: boolean };
const CENTS = 100;

// Two things: the balance (one card: what's available and the withdraw,
// what's held, what left, the months) and the ledger it is all made of.
export function EarningsView({ summary: s, months, ledger, payout, openWithdraw }: Props) {
  const t = useTranslations("creator.earnings");
  const tt = useTranslations("creator.trail");
  const format = useFormatter();
  const [withdrawing, setWithdrawing] = useState(openWithdraw && s.availableCents > 0);
  const [open, setOpen] = useState<BalanceKey | null>(null);
  // bumps once per successful withdrawal so the coin runs each time
  const [coins, setCoins] = useState(0);
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const trail = earningsTrail(ledger, (r) => t(`ledger.types.${r.type}`), { bank: t("withdraw.method.bank"), stripe: t("withdraw.method.stripe") });
  const views: Record<BalanceKey, { label: string; value: number; rows: TrailRow[] }> = {
    available: { label: t("stats.available.label"), value: s.availableCents, rows: trail.available },
    awaiting: { label: t("stats.awaitingRelease.label"), value: s.awaitingReleaseCents, rows: trail.awaiting },
    withdrawn: { label: t("stats.withdrawn.label"), value: s.withdrawnCents, rows: trail.withdrawn },
    earned: { label: t("stats.earned.label"), value: s.totalEarnedCents, rows: trail.earned },
  };
  const active = open ? views[open] : undefined;
  return (
    <div className="grid gap-6">
      <BalanceCard summary={s} months={months} coins={coins} onWithdraw={() => setWithdrawing(true)} onOpen={setOpen} />
      <CreatorLedger rows={ledger} />
      <TrailDrawer open={active !== undefined} onOpenChange={(v) => !v && setOpen(null)} title={active ? tt("title", { metric: active.label, count: active.rows.length }) : ""} total={active ? money(active.value) : ""} rows={active?.rows ?? []} emptyText={tt("empty.body")} formatAmount={money}
        formatTime={(iso) => format.dateTime(new Date(iso), { dateStyle: "medium" })} />
      <WithdrawDialog open={withdrawing} onOpenChange={setWithdrawing} availableCents={s.availableCents} awaitingReleaseCents={s.awaitingReleaseCents} payout={payout} onWithdrawn={() => setCoins((n) => n + 1)} />
    </div>
  );
}
