"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { ProfessionalFields } from "@/features/profile-fields/components/ProfessionalFields";
import { type ProfessionalInput, professionalSchema } from "../../schemas";
import { completeOnboarding, saveProfessionalInfo } from "../../server/actions";

// The legal details for invoicing — now, or later from Settings. Either
// button finishes onboarding and opens the workspace.
export function LegalForm({ defaults }: { defaults: Partial<ProfessionalInput> }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [skipping, setSkipping] = useState(false);
  const form = useForm<ProfessionalInput>({ resolver: zodResolver(professionalSchema), defaultValues: defaults });
  const busy = form.formState.isSubmitting || skipping;

  async function onSubmit(values: ProfessionalInput) {
    setError(null);
    const result = await saveProfessionalInfo(values);
    if (!result.ok) return setError(result.error);
    router.push(result.data.redirectTo);
  }

  async function later() {
    setError(null);
    setSkipping(true);
    const result = await completeOnboarding();
    if (!result.ok) {
      setSkipping(false);
      return setError(result.error);
    }
    router.push(result.data.redirectTo);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      <ProfessionalFields control={form.control} />
      <FormAlert message={error} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="submit" size="lg" className="h-11" disabled={busy}>{form.formState.isSubmitting ? t("common.opening") : t("common.continue")}</Button>
        <Button type="button" variant="secondary" size="lg" className="h-11" disabled={busy} onClick={later}>{skipping ? t("common.opening") : t("common.later")}</Button>
      </div>
      <p className="text-small text-ink-muted">{t("creator.legal.laterNote")}</p>
    </form>
  );
}
