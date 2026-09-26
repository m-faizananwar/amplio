"use client";

import { useTranslations } from "next-intl";
import { saveProfessionalInfo } from "@/features/creator-onboarding/server/actions";
import { type ProfessionalInput, professionalSchema } from "@/features/creator-onboarding/schemas";
import { ProfessionalFields } from "@/features/profile-fields/components/ProfessionalFields";
import { SaveRow } from "../shared/SaveRow";
import { SettingsSection } from "../shared/SettingsSection";
import { useSectionForm } from "../shared/useSectionForm";
import { type PayoutDefaults, PayoutForm } from "./PayoutForm";

// Everything about being paid in one section: where withdrawals go, then the
// legal details invoices need. Two forms (two actions), one topic.
export function GettingPaidSection({ payout, business }: { payout: PayoutDefaults; business: ProfessionalInput }) {
  const t = useTranslations("settings.creator");
  const { form, onSubmit } = useSectionForm({ schema: professionalSchema, defaults: business, save: saveProfessionalInfo, saved: t("states.saved") });
  return (
    <SettingsSection id="payouts" title={t("gettingPaid.title")} description={t("gettingPaid.description")}>
      <div className="grid gap-6">
        <PayoutForm defaults={payout} />
        <div className="grid gap-4 border-t border-rule pt-6">
          <div>
            <h3 className="text-lead font-semibold">{t("business.title")}</h3>
            <p className="text-small text-ink-muted">{t("business.description")}</p>
          </div>
          <form onSubmit={onSubmit} noValidate><ProfessionalFields control={form.control} /><SaveRow form={form} /></form>
        </div>
      </div>
    </SettingsSection>
  );
}
