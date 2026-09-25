"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/components/shell/WalletProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MoneyInput } from "@/features/profile-fields/components/MoneyInput";
import { MIN_WITHDRAWAL_CENTS, type PayoutMethod } from "../../constants";
import { withdrawEarnings } from "../../server/actions";

export type PayoutOnFile = { method: "stripe" | "bank" | null; accountHolder: string; ibanLast4: string };
type Props = { open: boolean; onOpenChange: (open: boolean) => void; availableCents: number; awaitingReleaseCents: number; payout: PayoutOnFile };

const CENTS = 100;

type AmountProps = { cents: number; setCents: (c: number) => void; availableCents: number; error: string | null; money: (c: number) => string };

function AmountField({ cents, setCents, availableCents, error, money }: AmountProps) {
  const t = useTranslations("creator.earnings.withdraw");
  return (
    <div className="grid gap-1.5">
      <label htmlFor="withdraw-amount" className="text-small font-medium">{t("amount.label")}</label>
      <div className="flex gap-2">
        <div className="flex-1"><MoneyInput id="withdraw-amount" cents={cents} onCents={setCents} invalid={Boolean(error)} /></div>
        <Button type="button" variant="secondary" onClick={() => setCents(availableCents)} disabled={availableCents <= 0}>{t("amount.withdrawAll")}</Button>
      </div>
      <p className={`text-caption ${error ? "text-failure" : "text-ink-muted"}`} role={error ? "alert" : undefined}>{error ?? t("amount.help", { amount: money(availableCents) })}</p>
    </div>
  );
}

// Where the money goes: the bank on file, or the plain word that Stripe isn't connected.
function MethodNote({ method, payout }: { method: PayoutMethod; payout: PayoutOnFile }) {
  const t = useTranslations("creator.earnings.withdraw");
  const text = method === "stripe" ? `${t("method.stripeStatus")} · ${t("stubNote")}` : payout.ibanLast4 ? t("method.bankOnFile", { name: payout.accountHolder || "—", last4: payout.ibanLast4 }) : t("method.bankMissing");
  return (
    <p className="text-small text-ink-muted">
      {text} <Link href="/creator/settings#payouts" className="text-info hover:underline">{t("method.editDetails")}</Link>
    </p>
  );
}

// Optimistic wallet, the action, then refresh; the wallet rolls back on failure.
function useWithdraw(availableCents: number, onDone: () => void) {
  const t = useTranslations("creator.earnings.withdraw");
  const format = useFormatter();
  const router = useRouter();
  const wallet = useWallet(availableCents);
  const [pending, setPending] = useState(false);
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  async function withdraw(cents: number, method: PayoutMethod) {
    setPending(true);
    const before = wallet.walletCents;
    wallet.setWalletCents(before - cents);
    const result = await withdrawEarnings({ amountCents: cents, method });
    setPending(false);
    if (!result.ok) {
      wallet.setWalletCents(before);
      toast.error(t("errors.failed"));
      return;
    }
    toast.success(t("success", { amount: money(cents), remaining: money(result.data.availableCents) }));
    onDone();
    router.refresh();
  }
  return { withdraw, pending };
}

// Amount (or all of it), where it goes, one confirm. The ledger is the rail:
// Stripe isn't connected, and the dialog says so.
export function WithdrawDialog({ open, onOpenChange, availableCents, awaitingReleaseCents, payout }: Props) {
  const t = useTranslations("creator.earnings.withdraw");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const [method, setMethod] = useState<PayoutMethod>(payout.method ?? "bank");
  const [cents, setCents] = useState(0);
  const { withdraw, pending } = useWithdraw(availableCents, () => { setCents(0); onOpenChange(false); });
  const error = cents === 0 ? null : cents < MIN_WITHDRAWAL_CENTS ? t("validation.min", { amount: money(MIN_WITHDRAWAL_CENTS) }) : cents > availableCents ? t("validation.overBalance") : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <SegmentedControl label={t("method.label")} value={method} onValueChange={setMethod} options={[{ value: "bank", label: t("method.bank") }, { value: "stripe", label: t("method.stripe") }]} />
          <MethodNote method={method} payout={payout} />
          <AmountField cents={cents} setCents={setCents} availableCents={availableCents} error={error} money={money} />
          <p className="rounded-control bg-tint px-3 py-2 text-caption text-ink-muted">{awaitingReleaseCents > 0 ? t("awaitingNote", { amount: money(awaitingReleaseCents) }) : t("awaitingNone")}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button type="button" onClick={() => withdraw(cents, method)} disabled={pending || cents === 0 || Boolean(error)}>{pending ? t("pending") : t("confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
