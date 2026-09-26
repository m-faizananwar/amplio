"use client";

import { Mail, UserRound } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { Input } from "@/components/ui/input";
import { describedBy, FormField } from "@/features/profile-fields/components/FormField";
import { cn } from "@/lib/cn";
import { HEARD_ABOUT_OPTIONS } from "../constants";
import { type RegisterInput, type Role, registerSchema } from "../schemas";
import { register } from "../server/actions";
import { FormAlert } from "./FormAlert";

// the stored values stay the schema's English enums; only the labels translate
const HEARD_KEY: Record<(typeof HEARD_ABOUT_OPTIONS)[number], string> = { LinkedIn: "linkedin", "Word of mouth": "wordOfMouth", "Google search": "google", "A creator": "creator", Other: "other" };

// The creator card's "book" link carries ?ref=<handle>. Read at submit rather
// than with useSearchParams, so the sign-up pages can be prerendered.
const refParam = () => new URLSearchParams(window.location.search).get("ref") ?? undefined;

export function RegisterForm({ role }: { role: Role }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { role, firstName: "", lastName: "", email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;
  const brand = role === "brand";

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await register({ ...values, ref: refParam() });
    if (!result.ok) return setServerError(result.error);
    router.push(result.data.redirectTo);
  }

  const err = (field: "firstName" | "lastName" | "email" | "password") => (errors[field] ? t(`errors.${field}`) : undefined);
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label={t("signUp.firstName")} error={err("firstName")}>
          <Input id="firstName" aria-describedby={describedBy("firstName", err("firstName"))} leadingIcon={<UserRound />} placeholder={t("signUp.firstNamePlaceholder")} autoComplete="given-name" aria-invalid={!!errors.firstName} {...form.register("firstName")} />
        </FormField>
        <FormField id="lastName" label={t("signUp.lastName")} error={err("lastName")}>
          <Input id="lastName" aria-describedby={describedBy("lastName", err("lastName"))} leadingIcon={<UserRound />} placeholder={t("signUp.lastNamePlaceholder")} autoComplete="family-name" aria-invalid={!!errors.lastName} {...form.register("lastName")} />
        </FormField>
      </div>
      <FormField id="email" label={t(brand ? "signUp.emailBrand" : "signUp.emailCreator")} error={err("email")}>
        <Input id="email" aria-describedby={describedBy("email", err("email"))} leadingIcon={<Mail />} type="email" autoComplete="email" placeholder={t(brand ? "signUp.emailPlaceholderBrand" : "signUp.emailPlaceholderCreator")} aria-invalid={!!errors.email} {...form.register("email")} />
      </FormField>
      <FormField id="password" label={t("signUp.password")} hint={t("signUp.passwordPlaceholder")} error={err("password")}>
        <PasswordInput id="password" aria-describedby={describedBy("password", err("password"), t("signUp.passwordPlaceholder"))} placeholder={t("signUp.passwordField")} autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
      </FormField>
      <Controller
        control={form.control}
        name="heardAbout"
        render={({ field }) => (
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-small font-medium">{t("signUp.heardAbout")} <span className="font-normal text-ink-muted">· {t("signUp.optional")}</span></legend>
            <div className="flex flex-wrap gap-1.5">
              {HEARD_ABOUT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={field.value === option}
                  onClick={() => field.onChange(field.value === option ? undefined : option)}
                  className={cn("rounded-chip border px-3 py-1 text-small transition-colors duration-(--duration-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-money", field.value === option ? "border-ink bg-ink text-paper" : "border-rule hover:bg-tint")}
                >
                  {t(`signUp.heard.${HEARD_KEY[option]}`)}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      />
      <FormAlert message={serverError} />
      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>{isSubmitting ? t("signUp.submitting") : t("signUp.submit")}</Button>
      <p className="text-center text-small text-ink-muted">
        {t("signUp.haveAccount")} <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">{t("signUp.signIn")}</Link>
      </p>
      <p className="text-center text-caption text-ink-muted">{t("signUp.demoHint")}</p>
    </form>
  );
}
