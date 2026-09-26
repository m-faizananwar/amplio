"use client";

import { Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { Input } from "@/components/ui/input";
import { describedBy, FormField } from "@/features/profile-fields/components/FormField";
import { type LoginInput, loginSchema } from "../schemas";
import { login } from "../server/actions";
import { FormAlert } from "./FormAlert";

// Where the proxy sent them from (?next=/brand/…). Read at submit rather than
// passed from the page, so the sign-in page can be prerendered. Same-site
// paths only: "//host" would leave the site.
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await login(values);
    if (!result.ok) return setServerError(result.error);
    router.push(nextPath() ?? result.data.redirectTo);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField id="email" label={t("signIn.email")} error={errors.email ? t("errors.email") : undefined}>
        <Input id="email" aria-describedby={describedBy("email", errors.email ? t("errors.email") : undefined)} leadingIcon={<Mail />} type="email" autoComplete="email" placeholder={t("signIn.emailPlaceholder")} aria-invalid={!!errors.email} {...form.register("email")} />
      </FormField>
      <FormField id="password" label={t("signIn.password")} error={errors.password ? t("errors.passwordRequired") : undefined}>
        <PasswordInput id="password" aria-describedby={describedBy("password", errors.password ? t("errors.passwordRequired") : undefined)} placeholder={t("signIn.passwordField")} autoComplete="current-password" aria-invalid={!!errors.password} {...form.register("password")} />
      </FormField>
      <Link href="/forgot-password" className="-mt-1 justify-self-end text-small text-ink-muted underline-offset-4 hover:text-ink hover:underline">{t("signIn.forgot")}</Link>
      <FormAlert message={serverError} />
      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>{isSubmitting ? t("signIn.submitting") : t("signIn.submit")}</Button>
      <p className="text-center text-small text-ink-muted">
        {t("signIn.noAccount")} <Link href="/register" className="font-medium text-ink underline-offset-4 hover:underline">{t("signIn.signUp")}</Link>
      </p>
    </form>
  );
}
