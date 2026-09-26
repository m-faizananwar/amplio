"use client";

import { Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/profile-fields/components/FormField";
import { type ForgotPasswordInput, forgotPasswordSchema } from "../schemas";
import { requestPasswordReset } from "../server/reset-actions";
import { FormAlert } from "./FormAlert";

type Outcome = { email: string; resetUrl: string | null; emailed: boolean } | null;

// On success the link is always shown on screen, labelled by whether it was
// also emailed (Resend, when configured) — this build may send no email.
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: ForgotPasswordInput) {
    setServerError(null);
    const result = await requestPasswordReset(values);
    if (!result.ok) return setServerError(result.error);
    setOutcome({ email: values.email, resetUrl: result.data.resetUrl, emailed: result.data.emailed });
  }

  if (outcome) return <ResetLinkBox outcome={outcome} onRetry={() => setOutcome(null)} />;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField id="email" label={t("forgot.email")} error={errors.email ? t("errors.email") : undefined}>
        <Input id="email" leadingIcon={<Mail />} type="email" placeholder={t("forgot.emailPlaceholder")} autoComplete="email" aria-invalid={!!errors.email} {...form.register("email")} />
      </FormField>
      <FormAlert message={serverError} />
      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>{isSubmitting ? t("forgot.submitting") : t("forgot.submit")}</Button>
      <p className="text-center text-small text-ink-muted">
        {t("forgot.remembered")} <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">{t("forgot.back")}</Link>
      </p>
    </form>
  );
}

function ResetLinkBox({ outcome, onRetry }: { outcome: NonNullable<Outcome>; onRetry: () => void }) {
  const t = useTranslations("auth.forgot");
  return (
    <div className="grid gap-4" role="status">
      {outcome.resetUrl ? (
        <div className="rounded-card border border-rule bg-surface p-4">
          <p className="text-small font-medium">{outcome.emailed ? t("emailedTitle") : t("notEmailedTitle")}</p>
          <p className="mt-1.5 text-small text-ink-muted">{outcome.emailed ? t("emailedBody", { email: outcome.email }) : t("notEmailedBody", { email: outcome.email })} {t("linkNote")}</p>
          <Link href={outcome.resetUrl} className="num mt-3 block break-all rounded-control border border-rule bg-paper px-3 py-2 text-caption text-info hover:underline">{outcome.resetUrl}</Link>
        </div>
      ) : (
        <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">
          {t("noAccountBody", { email: outcome.email })} <Link href="/register" className="font-medium underline">{t("createAccount")}</Link>
        </p>
      )}
      <Button type="button" variant="secondary" size="lg" className="h-11" onClick={onRetry}>{t("tryAgain")}</Button>
    </div>
  );
}
