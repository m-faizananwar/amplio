import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.meta"))("forgot") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgot");
  return (
    <AuthColumn>
      <h1 className="text-h2">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("sub")}</p>
      <div className="mt-8"><ForgotPasswordForm /></div>
    </AuthColumn>
  );
}
