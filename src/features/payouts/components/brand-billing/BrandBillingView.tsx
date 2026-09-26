"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/components/shell/WalletProvider";
import { TOPUP_PRESETS_CENTS } from "../../constants";
import type { LedgerRowDto } from "../../schemas";
import { topUpWallet } from "../../server/actions";
import type { BillingBuckets } from "../../server/queries";
import { BalanceCard } from "./BalanceCard";
import { LedgerRows } from "./LedgerRows";
import { TopUpDialog } from "./TopUpDialog";

const CENTS = 100;
const DEFAULT_PRESET = 1;

type Props = { balanceCents: number; buckets: BillingBuckets; rows: LedgerRowDto[]; suggestedCents: number | null };

// Two blocks: the balance card (available, with the top-up; then held,
// committed, paid in the order money moves) and the ledger behind it.
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
    <div className="grid gap-8">
      <BalanceCard walletCents={wallet.walletCents} buckets={buckets} euros={euros} credited={credited} onTopUp={() => setDialog({ open: true, cents: TOPUP_PRESETS_CENTS[DEFAULT_PRESET], suggested: false })} />
      <LedgerRows rows={rows} />
      {dialog.open ? <TopUpDialog open onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} initialCents={dialog.cents} suggested={dialog.suggested} onSubmit={submit} /> : null}
    </div>
  );
}
