import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { CreatorCardBlock } from "@/features/workspace/components/overview/CreatorCardBlock";
import { ActiveCollaborations, RecommendedOpportunities } from "@/features/workspace/components/overview/CreatorOverviewPanels";
import { LaunchGuide } from "@/features/workspace/components/overview/LaunchGuide";
import { StatTile } from "@/features/workspace/components/overview/StatTile";
import { getPublicCard } from "@/features/workspace/server/card-queries";
import { getCreatorOverview } from "@/features/workspace/server/overview-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Creator workspace · ${BRAND.wordmark}` };

// Layout follows the reference overview: tiles, card block + launch guide,
// then recommended opportunities + active collaborations.
export default async function CreatorOverviewPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const [overview, card, h] = await Promise.all([getCreatorOverview(viewer.creator.id), getPublicCard(viewer.creator.handle), headers()]);
  if (!card) redirect("/login");
  const cardLink = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}/c/${viewer.creator.handle}`;
  const ready = card.priceCents > 0 && card.industries.length > 0;
  return (
    <>
      <PageHeader eyebrow="Creator workspace" title={`Good to see you, ${viewer.firstName}`} description="Your creator activity, at a glance." />
      <div className="grid gap-4">
        <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Public post reach" value={overview.reach > 0 ? overview.reach.toLocaleString("en-US") : "—"} hint={overview.reach > 0 ? "Impressions across imported posts" : "Waiting for public post data"} />
          <StatTile label="Public posts" value={String(overview.posts)} hint="Original LinkedIn posts found" />
          <StatTile label="Public engagements" value={overview.engagements.toLocaleString("en-US")} hint="Reactions, comments and reposts" />
          <StatTile label="LinkedIn followers" value={overview.followers.toLocaleString("en-US")} hint="Imported from the public profile" />
        </div>
        </Reveal>
        <Reveal>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <CreatorCardBlock card={card} cardLink={cardLink} />
          <LaunchGuide ready={ready} />
        </div>
        </Reveal>
        <Reveal>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <RecommendedOpportunities items={overview.recommended} />
          <ActiveCollaborations items={overview.active} />
        </div>
        </Reveal>
      </div>
    </>
  );
}
