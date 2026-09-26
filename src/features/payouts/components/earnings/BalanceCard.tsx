"use client";

import { ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { CoinTrail } from "@/components/graphics/CoinTrail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { EarningsSummary, MonthPoint } from "../../server/queries";
import { type BalanceFigure, BalanceFigures } from "./BalanceFigures";
import { MonthBars } from "./MonthBars";

export type BalanceKey = "available" | "awaiting" | "withdrawn" | "earned";
type Props = { summary: EarningsSummary; months: MonthPoint[]; coins: number; onWithdraw: () => void; onOpen: (key: BalanceKey) => void };

const CENTS = 100;

// One card for the money: what can leave now (with the one action that moves
// it), the three figures around it, and the months it came in. Every figure
// opens the rows it is made of.
export function BalanceCard({ summary: s, months, coins, onWithdraw, onOpen }: Props) {
  const t = useTranslations("creator.earnings");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const figures: BalanceFigure[] = [
    { key: "awaiting", label: t("stats.awaitingRelease.label"), hint: t("stats.awaitingRelease.hint", { count: s.awaitingReleaseCount }), value: s.awaitingReleaseCents },
    { key: "withdrawn", label: t("stats.withdrawn.label"), hint: t("stats.withdrawn.hint"), value: s.withdrawnCents },
    { key: "earned", label: t("stats.earned.label"), hint: t("stats.earned.hint"), value: s.totalEarnedCents },
  ];
  return (
    <Card className="gap-0 py-0">
      <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="relative">
          <p className="text-small text-ink-muted">{t("stats.available.label")}</p>
          <p className="mt-1 text-h1 font-semibold tracking-(--tracking-heading) text-money"><RollingNumber value={s.availableCents} format={money} /></p>
          <button type="button" onClick={() => onOpen("available")} className="mt-1 inline-flex items-center gap-0.5 rounded-control text-caption text-ink-muted outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ink/15">
            {t("stats.available.hint")} · {t("stats.openTrail")}<ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
          {coins > 0 ? <CoinTrail key={coins} /> : null}
        </div>
        <div className="grid gap-1.5 sm:justify-items-end">
          <Button type="button" onClick={onWithdraw} disabled={s.availableCents <= 0}>{t("withdraw.button")}</Button>
          {s.availableCents <= 0 ? <p className="max-w-xs text-caption text-ink-muted sm:text-right">{t("withdraw.disabledReason")}</p> : null}
        </div>
      </div>
      <BalanceFigures figures={figures} format={money} onOpen={onOpen} />
      <div className="grid gap-3 border-t border-rule p-5">
        <p className="text-small font-medium text-ink">{t("chart.title")}</p>
        <MonthBars months={months} />
      </div>
    </Card>
  );
}
