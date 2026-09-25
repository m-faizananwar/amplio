"use client";

import { Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Burst } from "@/components/graphics/Burst";
import { useWallet } from "@/components/shell/WalletProvider";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { TOPUP_PRESETS_CENTS } from "../../constants";
import type { LedgerRowDto } from "../../schemas";
import { topUpWallet } from "../../server/actions";
import type { BillingBuckets } from "../../server/queries";
import { LedgerRows } from "./LedgerRows";
import { TopUpDialog } from "./TopUpDialog";

const CENTS = 100;
const DEFAULT_PRESET = 1;

type Props = { balanceCents: number; buckets: BillingBuckets; rows: LedgerRowDto[]; suggestedCents: number | null };

// Where the money is, left to right in the order it moves: available, held
// for invitations nobody has answered, committed to accepted work, paid.
// A top-up updates the balance and the ledger at once and rolls back on error.
export function BrandBillingView({ balanceCents, buckets, rows: initialRows, suggestedCents }: Props) {
  const t = useTranslations("brand.billing");
  const format = useFormatter();
  const router = useRouter();
  const wallet = useWallet(balanceCents);
  const [rows, setRows] = useState(initialRows);
  const [credited, setCredited] = useState(0);
  const [dialog, setDialog] = useState({ open: suggestedCents !== null, cents: suggestedCents ?? TOPUP_PRESETS_CENTS[DEFAULT_PRESET], suggested: suggestedCents !== null });
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });

  async function submit(cents: number) {
    const before = { rows, wallet: wallet.walletCents };
    const pending: LedgerRowDto = { id: `pending-${cents}`, date: new Date().toISOString(), type: "topup", status: "pending", amountCents: cents, reference: "TU-…", description: t("topUp.crediting") };
    setRows([pending, ...rows]);
    wallet.setWalletCents(before.wallet + cents);
    setDialog((d) => ({ ...d, open: false }));
    const result = await topUpWallet({ amountCents: cents });
    if (!result.ok) {
      setRows(before.rows);
      wallet.setWalletCents(before.wallet);
      toast.error(result.error);
      return;
    }
    setRows((current) => current.map((r) => (r.id === pending.id ? result.data.row : r)));
    wallet.setWalletCents(result.data.balanceCents);
    setCredited((n) => n + 1);
    toast.success(t("topUp.done", { amount: euros(cents), balance: euros(result.data.balanceCents) }));
    router.refresh();
  }

  return (
    <div className="grid gap-12">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative grid gap-3 rounded-card border border-rule bg-surface p-5">
          {credited > 0 ? <Burst key={credited} /> : null}
          <StatCard className="border-0 p-0" label={t("buckets.available.label")} value={wallet.walletCents} format={euros} tone="money" hint={t("buckets.available.hint")} />
          <Button size="sm" className="justify-self-start" onClick={() => setDialog({ open: true, cents: TOPUP_PRESETS_CENTS[DEFAULT_PRESET], suggested: false })}><Plus aria-hidden="true" />{t("topUp.open")}</Button>
        </div>
        <StatCard label={t("buckets.held.label")} value={buckets.heldCents} format={euros} hint={t("buckets.held.hint", { count: buckets.heldCount })} />
        <StatCard label={t("buckets.committed.label")} value={buckets.committedCents} format={euros} hint={t("buckets.committed.hint", { count: buckets.committedCount })} />
        <StatCard label={t("buckets.paid.label")} value={buckets.paidCents} format={euros} hint={t("buckets.paid.hint", { count: buckets.paidCount })} />
      </div>
      <LedgerRows rows={rows} />
      {dialog.open ? <TopUpDialog open onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} initialCents={dialog.cents} suggested={dialog.suggested} onSubmit={submit} /> : null}
    </div>
  );
}
