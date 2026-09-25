import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingPage } from "@/features/public/components/pages/PricingPage";
import { getPublicTrail } from "@/features/public/server/trail-queries";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  const t = await getTranslations({ locale, namespace: "public.pricing.meta" });
  return { title: t("title"), description: t("description") };
}

// Static per locale, re-read at most once a minute: the numbers are the demo
// workspace's, and a minute behind is fine for a marketing page.
export const revalidate = 60;

export default async function Page(props: LocaleParams) {
  await enterLocale(props);
  return <PricingPage trail={await getPublicTrail()} />;
}
