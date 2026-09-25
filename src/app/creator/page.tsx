import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getViewer } from "@/features/auth/server/session";
import { listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { getEarningsSummary } from "@/features/payouts/server/queries";
import { getTrackedLinkPerformance } from "@/features/tracking/server/creator-queries";
import { CreatorOverview } from "@/features/workspace/components/overview/creator/CreatorOverview";
import { getPublicCard } from "@/features/workspace/server/card-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Overview · ${BRAND.wordmark}` };

export default async function CreatorOverviewPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const creatorId = viewer.creator.id;
  let data;
  try {
    data = await Promise.all([
      listCreatorCollaborations(creatorId),
      getEarningsSummary(creatorId),
      getPublicCard(viewer.creator.handle),
      getTrackedLinkPerformance(creatorId),
    ]);
  } catch (error) {
    console.error("[overview] creator overview failed", { creatorId, error });
    return <ErrorState body="We could not load your overview. Try again in a moment." retryHref="/creator" />;
  }
  const [collaborations, earnings, card, links] = data;
  const setupIncomplete = !card || card.priceCents <= 0 || card.industries.length === 0;
  const clicks = links.reduce((sum, l) => sum + l.clicks, 0);
  return <CreatorOverview firstName={viewer.firstName} collaborations={collaborations} earnings={earnings} clicks={clicks} setupIncomplete={setupIncomplete} />;
}
