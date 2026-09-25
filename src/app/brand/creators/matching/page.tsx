import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { CreatorsTabs } from "@/features/marketplace/components/CreatorsTabs";
import { MatchingView } from "@/features/marketplace/components/matching/MatchingView";
import { parseMarketplaceQuery, type RawSearchParams } from "@/features/marketplace/schemas";
import { loadMatchingPage } from "@/features/marketplace/server/queries";

export const metadata: Metadata = { title: `Creators · ${BRAND.wordmark}` };

export default async function BrandMatchingPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseMarketplaceQuery(await searchParams);
  const [data, t] = await Promise.all([loadMatchingPage(query), getTranslations("brand.creators")]);
  const header = <PageHeader title={t("title")} description={t("description")} />;
  if (data.kind !== "ok") return <>{header}<ErrorState body={t("error")} retryHref="/brand/creators/matching" /></>;
  return (
    <>
      {header}
      <CreatorsTabs active="matching" campaignId={data.ctx.selectedCampaign?.id} />
      <MatchingView ctx={data.ctx} />
    </>
  );
}
