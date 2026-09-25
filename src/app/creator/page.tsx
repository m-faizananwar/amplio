import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getViewer } from "@/features/auth/server/session";
import { listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { getCreatorLedger, getEarningsSummary } from "@/features/payouts/server/queries";
import { getTrackedLinkPerformance, listCreatorClicks } from "@/features/tracking/server/creator-queries";
import { CreatorOverview } from "@/features/workspace/components/overview/creator/CreatorOverview";
import { getPublicCard } from "@/features/workspace/server/card-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Overview · ${BRAND.wordmark}` };

function setupGap(card: { priceCents: number; industries: string[] } | null) {
  const noPrice = !card || card.priceCents <= 0;
  const noIndustries = !card || card.industries.length === 0;
  if (noPrice && noIndustries) return "detailBoth" as const;
  if (noPrice) return "detailPrice" as const;
  return noIndustries ? ("detailIndustries" as const) : null;
}

export default async function CreatorOverviewPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const creatorId = viewer.creator.id;
  let data;
  try {
    data = await Promise.all([
      listCreatorCollaborations(creatorId),
      getEarningsSummary(creatorId),
      getCreatorLedger(creatorId),
      getPublicCard(viewer.creator.handle),
      getTrackedLinkPerformance(creatorId),
      listCreatorClicks(creatorId),
    ]);
  } catch (error) {
    console.error("[overview] creator overview failed", { creatorId, error });
    return <ErrorState title={(await getTranslations("creator.overview"))("error.title")} body={(await getTranslations("creator.overview"))("error.body")} retryHref="/creator" />;
  }
  const [collaborations, earnings, ledger, card, links, clicks] = data;
  const clickTotal = links.reduce((sum, l) => sum + l.clicks, 0);
  return <CreatorOverview collaborations={collaborations} earnings={earnings} ledger={ledger} clicks={clicks} clickTotal={clickTotal} setup={setupGap(card)} />;
}
