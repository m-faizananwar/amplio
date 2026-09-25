import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingPage } from "@/features/public/components/pages/PricingPage";
import { getPublicTrail } from "@/features/public/server/trail-queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.pricing.meta");
  return { title: t("title"), description: t("description") };
}

export const dynamic = "force-dynamic";

export default async function Page() {
  return <PricingPage trail={await getPublicTrail()} />;
}
