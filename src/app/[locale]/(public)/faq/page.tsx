import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqPage } from "@/features/public/components/pages/FaqPage";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  const t = await getTranslations({ locale, namespace: "public.faq.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Page(props: LocaleParams) {
  await enterLocale(props);
  return <FaqPage />;
}
