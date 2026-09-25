import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqPage } from "@/features/public/components/pages/FaqPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.faq.meta");
  return { title: t("title"), description: t("description") };
}

export default function Page() {
  return <FaqPage />;
}
