"use client";

import { Euro, Plus, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { useWallet } from "@/components/shell/WalletProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MAX_TOPUP_CENTS, MIN_TOPUP_CENTS, TOPUP_PRESETS_CENTS } from "../../constants";

const CENTS = 100;
const CUSTOM = "custom";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; initialCents: number; suggested: boolean; onSubmit: (cents: number) => void };

function CustomAmount({ value, onChange, invalid, limits }: { value: string; onChange: (v: string) => void; invalid: boolean; limits: string }) {
  const t = useTranslations("brand.billing.topUp");
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-medium">{t("customLabel")}</label>
      <Input id={id} leadingIcon={<Euro />} inputMode="decimal" className="num" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} placeholder="1500" autoFocus />
      <p className="text-caption text-ink-muted">{limits}</p>
    </div>
  );
}

// Four presets and a custom amount, with the balance before and after in
// view. There is no card in this build — the dialog says so, and the credit
// is a ledger row like any other.
export function TopUpDialog({ open, onOpenChange, initialCents, suggested, onSubmit }: Props) {
  const t = useTranslations("brand.billing.topUp");
  const format = useFormatter();
  const tStub = useTranslations("common.stub");
  const { walletCents } = useWallet();
  const preset = (TOPUP_PRESETS_CENTS as readonly number[]).includes(initialCents) ? String(initialCents) : CUSTOM;
  const [choice, setChoice] = useState(preset);
  const [custom, setCustom] = useState(preset === CUSTOM ? String(initialCents / CENTS) : "");
  const cents = choice === CUSTOM ? Math.round(Number(custom.replace(",", ".")) * CENTS) : Number(choice);
  const valid = Number.isFinite(cents) && cents >= MIN_TOPUP_CENTS && cents <= MAX_TOPUP_CENTS;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Wallet />}
      tone="money"
      title={t("title")}
      sub={suggested ? t("suggested") : t("description")}
      facts={[
        { label: t("facts.balance"), value: euros(walletCents), mono: true },
        { label: t("facts.after"), value: valid ? euros(walletCents + cents) : "—", mono: true, tone: "money" },
      ]}
      action={<Button type="button" variant="money" icon={<Plus />} disabled={!valid} onClick={() => onSubmit(cents)}>{t("submit", { amount: valid ? euros(cents) : euros(MIN_TOPUP_CENTS) })}</Button>}
      cancelLabel={t("cancel")}
    >
      <SegmentedControl
        label={t("amount")}
        value={choice}
        onValueChange={setChoice}
        className="w-full [&>*]:flex-1"
        options={[...TOPUP_PRESETS_CENTS.map((c) => ({ value: String(c), label: <span className="num">{euros(c)}</span> })), { value: CUSTOM, label: t("custom") }]}
      />
      {choice === CUSTOM ? <CustomAmount value={custom} onChange={setCustom} invalid={custom !== "" && !valid} limits={t("limits", { min: euros(MIN_TOPUP_CENTS), max: euros(MAX_TOPUP_CENTS) })} /> : null}
      <p className="text-caption text-ink-muted">{tStub("stripe")}</p>
    </ActionDialog>
  );
}
