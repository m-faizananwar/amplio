import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForCreatorsPage } from "@/features/public/components/pages/creators/ForCreatorsPage";
import { getShowcaseCreators } from "@/features/public/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.forCreators.meta");
  return { title: t("title"), description: t("description") };
}

export const dynamic = "force-dynamic";

export default async function Page() {
  const [creator] = await getShowcaseCreators();
  return <ForCreatorsPage creator={creator ?? null} />;
}
