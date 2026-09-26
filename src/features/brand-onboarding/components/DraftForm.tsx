"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { WizardActions } from "@/components/flow/WizardActions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { BrandProfileFields } from "@/features/profile-fields/components/BrandProfileFields";
import type { ProfileInput } from "../schemas";

type Props = {
  form: UseFormReturn<ProfileInput>;
  readFailedUrl: string | null;
  error: string | null;
  alreadySetUp: boolean;
  onFinish: (values: ProfileInput) => Promise<void>;
};

// The AI draft, editable in place: value proposition and three ideal
// customers. The form lives in BrandSetup so the preview card reads it live.
export function DraftForm({ form, readFailedUrl, error, alreadySetUp, onFinish }: Props) {
  const t = useTranslations("onboarding");
  const busy = form.formState.isSubmitting;
  return (
    <form onSubmit={form.handleSubmit(onFinish)} className="grid animate-rise gap-6 border-t border-rule pt-8" noValidate>
      <div>
        <h2 className="text-h3">{t("brand.draftTitle")}</h2>
        <p className="mt-1.5 text-ink-muted">{t("brand.draftSub")}</p>
        {readFailedUrl ? <p className="mt-3 rounded-control border border-attention/30 bg-attention-soft px-3 py-2 text-small text-attention">{t("brand.readFailed", { url: readFailedUrl })}</p> : null}
      </div>
      <BrandProfileFields control={form.control} />
      <FormAlert message={error} />
      <WizardActions backLabel={t("common.back")}>
        <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? t("brand.finishing") : t("brand.finish")}</Button>
      </WizardActions>
      {alreadySetUp ? <p className="text-center text-small text-ink-muted">{t("brand.alreadySetUp")}</p> : null}
    </form>
  );
}
