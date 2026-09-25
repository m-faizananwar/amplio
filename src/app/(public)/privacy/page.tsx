import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/features/public/components/pages/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.legal.privacy.meta");
  return { title: t("title"), description: t("description") };
}

export default function Page() {
  return <LegalPage doc="privacy" />;
}
