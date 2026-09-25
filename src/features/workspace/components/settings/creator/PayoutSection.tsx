"use client";

import { Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormField } from "@/features/profile-fields/components/FormField";
import { type PayoutDetailsInput, payoutDetailsSchema } from "../../../schemas";
import { updatePayoutDetails } from "../../../server/actions";
import { SaveRow } from "./SaveRow";
import { SettingsSection } from "./SettingsSection";
import { useSectionForm } from "./useSectionForm";

type Props = { defaults: { method: "stripe" | "bank" | null; accountHolder: string; ibanLast4: string } };

const METHOD_NOTE = {
  stripe: "Stripe payouts are not connected in this version: a withdrawal is recorded in your ledger straight away and nothing is sent.",
  bank: "SEPA transfer. A withdrawal shows as in transit until it settles, usually 1–7 days. Only the last 4 characters of the IBAN are stored.",
} as const;

// Settings-only: where withdrawals go. The ledger stands in for the payment rail.
export function PayoutSection({ defaults }: Props) {
  const { form, onSubmit } = useSectionForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaults: { method: defaults.method ?? "bank", accountHolder: defaults.accountHolder, iban: "" },
    save: updatePayoutDetails,
    saved: "Payout details saved",
  });
  const method = useWatch({ control: form.control, name: "method" });
  return (
    <SettingsSection id="payouts" title="Payouts" description="Where your withdrawals go.">
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <Controller control={form.control} name="method" render={({ field }) => (
          <SegmentedControl label="Payout method" value={field.value} onValueChange={field.onChange} options={[{ value: "bank", label: "Bank transfer" }, { value: "stripe", label: "Stripe" }]} />
        )} />
        <p className="text-small text-ink-muted">{METHOD_NOTE[method]}</p>
        {method === "bank" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller control={form.control} name="accountHolder" render={({ field, fieldState }) => (
              <FormField id="accountHolder" label="Account holder" error={fieldState.error?.message}>
                <Input id="accountHolder" autoComplete="name" {...field} />
              </FormField>
            )} />
            <Controller control={form.control} name="iban" render={({ field, fieldState }) => (
              <FormField id="iban" label="IBAN" hint={defaults.ibanLast4 ? `On file: •••• ${defaults.ibanLast4}. Leave empty to keep it.` : undefined} error={fieldState.error?.message}>
                <Input id="iban" className="num" autoComplete="off" placeholder="FR76 …" aria-invalid={fieldState.invalid || undefined} {...field} />
              </FormField>
            )} />
          </div>
        ) : null}
        <SaveRow form={form} />
      </form>
    </SettingsSection>
  );
}
