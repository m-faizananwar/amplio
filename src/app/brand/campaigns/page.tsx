import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { CampaignsLedger } from "@/features/campaigns/components/list/CampaignsLedger";
import { listCampaignCards } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";

export const metadata: Metadata = { title: `Campaigns · ${BRAND.wordmark}` };

export default async function BrandCampaignsPage() {
  const viewer = await requireBrand("/brand/campaigns");
  const t = await getTranslations("brand.campaigns.list");
  const header = <PageHeader title={t("title")} description={t("description")} actions={<Link href="/brand/campaigns/new" className={buttonVariants()}>{t("new")}</Link>} />;
  const result = await safeQuery("campaigns list", { brandId: viewer.brand.id }, () => listCampaignCards(viewer.brand.id));
  if (!result.ok) return <>{header}<ErrorState body={t("error")} retryHref="/brand/campaigns" /></>;
  return <>{header}<CampaignsLedger campaigns={result.data} /></>;
}
