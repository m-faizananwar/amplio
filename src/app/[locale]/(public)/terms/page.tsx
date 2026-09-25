import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/features/public/components/pages/LegalPage";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  const t = await getTranslations({ locale, namespace: "public.legal.terms.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Page(props: LocaleParams) {
  await enterLocale(props);
  return <LegalPage doc="terms" />;
}
