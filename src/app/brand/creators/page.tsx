import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { CreatorsTabs } from "@/features/marketplace/components/CreatorsTabs";
import { MarketplaceView } from "@/features/marketplace/components/MarketplaceView";
import { parseMarketplaceQuery, type RawSearchParams } from "@/features/marketplace/schemas";
import { loadMarketplacePage } from "@/features/marketplace/server/queries";

export const metadata: Metadata = { title: `Creators · ${BRAND.wordmark}` };

export default async function BrandCreatorsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseMarketplaceQuery(await searchParams);
  const [data, t] = await Promise.all([loadMarketplacePage(query), getTranslations("brand.creators")]);
  const header = <PageHeader title={t("title")} description={t("description")} />;
  if (data.kind !== "ok") return <>{header}<ErrorState body={t("error")} retryHref="/brand/creators" /></>;
  return (
    <>
      {header}
      <CreatorsTabs active="marketplace" campaignId={data.ctx.selectedCampaign?.id} />
      <MarketplaceView ctx={data.ctx} list={data.list} query={query} countries={data.countries} />
    </>
  );
}
