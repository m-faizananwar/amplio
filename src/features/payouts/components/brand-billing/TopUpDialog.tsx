"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MAX_TOPUP_CENTS, MIN_TOPUP_CENTS, TOPUP_PRESETS_CENTS } from "../../constants";

const CENTS = 100;
const CUSTOM = "custom";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; initialCents: number; suggested: boolean; onSubmit: (cents: number) => void };

// Four presets and a custom amount. There is no card in this build — the
// dialog says so, and the credit is a ledger row like any other.
export function TopUpDialog({ open, onOpenChange, initialCents, suggested, onSubmit }: Props) {
  const t = useTranslations("brand.billing.topUp");
  const format = useFormatter();
  const tStub = useTranslations("common.stub");
  const id = useId();
  const preset = (TOPUP_PRESETS_CENTS as readonly number[]).includes(initialCents) ? String(initialCents) : CUSTOM;
  const [choice, setChoice] = useState(preset);
  const [custom, setCustom] = useState(preset === CUSTOM ? String(initialCents / CENTS) : "");
  const cents = choice === CUSTOM ? Math.round(Number(custom.replace(",", ".")) * CENTS) : Number(choice);
  const valid = Number.isFinite(cents) && cents >= MIN_TOPUP_CENTS && cents <= MAX_TOPUP_CENTS;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{suggested ? t("suggested") : t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <SegmentedControl
            label={t("amount")}
            value={choice}
            onValueChange={setChoice}
            className="w-full [&>*]:flex-1"
            options={[...TOPUP_PRESETS_CENTS.map((c) => ({ value: String(c), label: <span className="num">{euros(c)}</span> })), { value: CUSTOM, label: t("custom") }]}
          />
          {choice === CUSTOM ? (
            <div className="grid gap-1.5">
              <label htmlFor={id} className="text-small font-medium">{t("customLabel")}</label>
              <Input id={id} inputMode="decimal" className="num" value={custom} onChange={(e) => setCustom(e.target.value)} aria-invalid={custom !== "" && !valid} placeholder="1500" autoFocus />
              <p className="text-caption text-ink-muted">{t("limits", { min: euros(MIN_TOPUP_CENTS), max: euros(MAX_TOPUP_CENTS) })}</p>
            </div>
          ) : null}
          <p className="rounded-control bg-tint px-3 py-2 text-caption text-ink-muted">{tStub("stripe")}</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button disabled={!valid} onClick={() => onSubmit(cents)}>{t("submit", { amount: valid ? euros(cents) : euros(MIN_TOPUP_CENTS) })}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
