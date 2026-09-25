import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";

export async function CampaignNotFound() {
  const t = await getTranslations("brand.campaigns.detail.notFound");
  return <ErrorState title={t("title")} body={t("body")} retryHref="/brand/campaigns" />;
}
