"use client";

import { useTranslations } from "next-intl";
import { Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormField } from "@/features/profile-fields/components/FormField";
import { type PayoutDetailsInput, payoutDetailsSchema } from "../../../schemas";
import { updatePayoutDetails } from "../../../server/actions";
import { SaveRow } from "../shared/SaveRow";
import { useSectionForm } from "../shared/useSectionForm";

export type PayoutDefaults = { method: "stripe" | "bank" | null; accountHolder: string; ibanLast4: string };
type Props = { defaults: PayoutDefaults };
const IBAN_KEPT = 4;

// Settings-only: where withdrawals go. The ledger stands in for the payment rail.
export function PayoutForm({ defaults }: Props) {
  const t = useTranslations("settings.creator.payouts");
  const { form, onSubmit } = useSectionForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaults: { method: defaults.method ?? "bank", accountHolder: defaults.accountHolder, iban: "" },
    save: updatePayoutDetails,
    saved: t("saved"),
  });
  const method = useWatch({ control: form.control, name: "method" });
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <Controller control={form.control} name="method" render={({ field }) => (
          <SegmentedControl label={t("method.label")} value={field.value} onValueChange={field.onChange} options={[{ value: "bank", label: t("method.bank") }, { value: "stripe", label: t("method.stripe") }]} />
        )} />
        <p className="text-small text-ink-muted">{method === "stripe" ? `${t("method.stripeStatus")} · ${t("method.stripeStub")}` : t("method.bankBody")}</p>
        {method === "bank" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller control={form.control} name="accountHolder" render={({ field }) => (
              <FormField id="accountHolder" label={t("accountHolder.label")}><Input id="accountHolder" autoComplete="name" placeholder={t("accountHolder.placeholder")} {...field} /></FormField>
            )} />
            <Controller control={form.control} name="iban" render={({ field, fieldState }) => (
              <FormField id="iban" label={t("iban.label")} hint={`${defaults.ibanLast4 ? `${t("iban.onFile", { last4: defaults.ibanLast4 })} · ` : ""}${t("iban.help", { count: IBAN_KEPT })}`} error={fieldState.error ? t("errors.ibanShort") : undefined}>
                <Input id="iban" className="num" autoComplete="off" placeholder={t("iban.placeholder")} aria-invalid={fieldState.invalid || undefined} {...field} />
              </FormField>
            )} />
          </div>
        ) : null}
        <SaveRow form={form} label={t("save")} />
      </form>
  );
}
