"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { describedBy, FormField } from "@/features/profile-fields/components/FormField";
import { type ResetPasswordInput, resetPasswordSchema } from "../schemas";
import { resetPassword } from "../server/reset-actions";
import { FormAlert } from "./FormAlert";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token, password: "", confirm: "" } });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: ResetPasswordInput) {
    setServerError(null);
    const result = await resetPassword(values);
    if (!result.ok) return setServerError(result.error);
    router.push(result.data.redirectTo);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <input type="hidden" {...form.register("token")} />
      <FormField id="password" label={t("reset.password")} hint={t("reset.passwordPlaceholder")} error={errors.password ? t("errors.password") : undefined}>
        <PasswordInput id="password" aria-describedby={describedBy("password", errors.password ? t("errors.password") : undefined, t("reset.passwordPlaceholder"))} placeholder={t("reset.passwordField")} autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
      </FormField>
      <FormField id="confirm" label={t("reset.confirm")} error={errors.confirm ? t("errors.confirm") : undefined}>
        <PasswordInput id="confirm" aria-describedby={describedBy("confirm", errors.confirm ? t("errors.confirm") : undefined)} placeholder={t("reset.confirmPlaceholder")} autoComplete="new-password" aria-invalid={!!errors.confirm} {...form.register("confirm")} />
      </FormField>
      <FormAlert message={serverError} />
      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>{isSubmitting ? t("reset.submitting") : t("reset.submit")}</Button>
    </form>
  );
}
