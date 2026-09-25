import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/page/ErrorState";
import { BRAND } from "@/config/brand";
import { CampaignHeader } from "@/features/campaigns/components/detail/CampaignHeader";
import { CampaignNotFound } from "@/features/campaigns/components/detail/CampaignNotFound";
import { getCampaignShell } from "@/features/campaigns/server/queries";
import { requireBrand } from "@/features/campaigns/server/require-brand";
import { safeQuery } from "@/features/campaigns/server/safe-query";
import { BrandCollaborationsList, type BrandListFilter } from "@/features/collaborations/components/brand-list/BrandCollaborationsList";
import { listBrandCollaborations } from "@/features/collaborations/server/queries";

export const metadata: Metadata = { title: `Campaign · ${BRAND.wordmark}` };

type Props = { params: Promise<{ campaignId: string }>; searchParams: Promise<{ filter?: string }> };
const FILTERS: readonly BrandListFilter[] = ["needs_you", "waiting", "done", "all"];

// The campaign's collaborations: the same next-step rows as Collaborations,
// scoped to this campaign.
export default async function CampaignCollaborationsPage({ params, searchParams }: Props) {
  const [{ campaignId }, { filter }] = await Promise.all([params, searchParams]);
  const viewer = await requireBrand(`/brand/campaigns/${campaignId}`);
  const t = await getTranslations("brand.campaigns.detail");
  const initial = (FILTERS as readonly string[]).includes(filter ?? "") ? (filter as BrandListFilter) : null;
  const result = await safeQuery("campaign collaborations", { brandId: viewer.brand.id, campaignId }, async () => {
    const shell = await getCampaignShell(viewer.brand.id, campaignId);
    if (!shell) return null;
    const rows = (await listBrandCollaborations(viewer.brand.id)).filter((r) => r.campaignId === campaignId);
    return { shell, rows };
  });
  if (!result.ok) return <ErrorState body={t("error")} retryHref={`/brand/campaigns/${campaignId}`} />;
  if (!result.data) return <CampaignNotFound />;
  return (
    <CampaignHeader shell={result.data.shell} tab="collaborations">
      <BrandCollaborationsList rows={result.data.rows} campaigns={[]} initialFilter={initial} />
    </CampaignHeader>
  );
}
