import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  return { title: (await getTranslations({ locale, namespace: "auth.meta" }))("forgot") };
}

export default async function ForgotPasswordPage(props: LocaleParams) {
  await enterLocale(props);
  const t = await getTranslations("auth.forgot");
  return (
    <AuthColumn>
      <h1 className="text-h2">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("sub")}</p>
      <div className="mt-8"><ForgotPasswordForm /></div>
    </AuthColumn>
  );
}
