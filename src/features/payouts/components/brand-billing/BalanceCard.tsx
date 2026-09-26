"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Burst } from "@/components/graphics/Burst";
import { Button } from "@/components/ui/button";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { BillingBuckets } from "../../server/queries";

type Props = { walletCents: number; buckets: BillingBuckets; euros: (cents: number) => string; credited: number; onTopUp: () => void };

// One card for where the money is: what can be spent now, large, with the
// top-up beside it; then, in the order money moves, what is held for
// invitations nobody has answered, committed to accepted work, and paid.
export function BalanceCard({ walletCents, buckets, euros, credited, onTopUp }: Props) {
  const t = useTranslations("brand.billing");
  const strip = [
    { key: "held", cents: buckets.heldCents, hint: t("buckets.held.hint", { count: buckets.heldCount }) },
    { key: "committed", cents: buckets.committedCents, hint: t("buckets.committed.hint", { count: buckets.committedCount }) },
    { key: "paid", cents: buckets.paidCents, hint: t("buckets.paid.hint", { count: buckets.paidCount }) },
  ] as const;
  return (
    <section aria-labelledby="balance-title" className="relative grid gap-6 rounded-card border border-rule bg-surface p-6 shadow-lift lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center">
      {credited > 0 ? <Burst key={credited} /> : null}
      <div className="grid gap-2">
        <h2 id="balance-title" className="text-small text-ink-muted">{t("buckets.available.label")}</h2>
        <p className="text-h1 font-semibold tracking-(--tracking-heading) text-money"><RollingNumber value={walletCents} format={euros} /></p>
        <p className="text-caption text-ink-muted">{t("buckets.available.hint")}</p>
        <Button variant="money" icon={<Plus />} className="mt-2 justify-self-start" onClick={onTopUp}>{t("topUp.open")}</Button>
      </div>
      <dl className="grid gap-px overflow-hidden rounded-control border border-rule bg-rule sm:grid-cols-3">
        {strip.map((cell) => (
          <div key={cell.key} className="grid content-start gap-1 bg-paper p-4">
            <dt className="text-caption text-ink-muted">{t(`buckets.${cell.key}.label`)}</dt>
            <dd className="text-h4 font-semibold"><RollingNumber value={cell.cents} format={euros} /></dd>
            <dd className="text-caption text-ink-muted">{cell.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
