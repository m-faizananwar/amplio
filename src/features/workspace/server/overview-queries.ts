import "server-only";
import { and, count, desc, eq, gte, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  brands, campaigns, collaborations, creators, messages, pixelEvents, shortlist, users,
} from "@/db/schema";
import { fitScore } from "@/lib/fit-score";
import { NEW_CREATORS_LIMIT, NEW_CREATORS_POOL } from "../constants";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

const DAY_MS = 86_400_000;
const RECENT_DAYS = 7;
const ACTIVATED = ["accepted", "draft_submitted", "changes_requested", "approved", "scheduled", "live", "paid"] as const;

export type BrandOverview = {
  creatorsActivated: number;
  postsPublished: number;
  profilesEngaged: number;
  impressions: number;
  draftsToReview: number;
  applicationsReceived: number;
  messagesThisWeek: number;
  activeCampaign: { id: string; name: string } | null;
  newCreators: Array<{ id: string; name: string; avatarUrl: string; industries: string[]; fit: number; priceCents: number }>;
};

async function loadBrandOverview(brandId: string): Promise<BrandOverview> {
  const db = getDb();
  const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
  const [activeCampaign] = await db
    .select({ id: campaigns.id, name: campaigns.name, brief: campaigns.brief })
    .from(campaigns)
    .where(and(eq(campaigns.brandId, brandId), eq(campaigns.status, "active")))
    .orderBy(desc(campaigns.createdAt))
    .limit(1);

  const [counts] = await db
    .select({
      activated: sql<number>`count(*) filter (where ${collaborations.status} in ('accepted','draft_submitted','changes_requested','approved','scheduled','live','paid'))::int`,
      published: sql<number>`count(*) filter (where ${collaborations.status} in ('live','paid'))::int`,
      drafts: sql<number>`count(*) filter (where ${collaborations.status} = 'draft_submitted')::int`,
      applied: sql<number>`count(*) filter (where ${collaborations.status} = 'applied')::int`,
      impressions: sql<number>`coalesce(sum(${creators.medianViews}) filter (where ${collaborations.status} in ('live','paid')), 0)::int`,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .where(eq(campaigns.brandId, brandId));

  const [engaged] = await db
    .select({ n: sql<number>`count(distinct coalesce(${pixelEvents.visitorId}, ${pixelEvents.id}::text))::int` })
    .from(pixelEvents)
    .where(eq(pixelEvents.brandId, brandId));

  const [recentMessages] = await db
    .select({ n: count() })
    .from(messages)
    .innerJoin(collaborations, eq(collaborations.id, messages.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(and(eq(campaigns.brandId, brandId), gte(messages.createdAt, new Date(Date.now() - RECENT_DAYS * DAY_MS))));

  const existing = db
    .select({ creatorId: collaborations.creatorId })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .where(eq(campaigns.brandId, brandId));
  const shortlisted = db.select({ creatorId: shortlist.creatorId }).from(shortlist).where(eq(shortlist.brandId, brandId));
  const candidates = await db
    .select({ creator: creators, firstName: users.firstName, lastName: users.lastName })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(and(notInArray(creators.id, existing), notInArray(creators.id, shortlisted)))
    .orderBy(desc(creators.followers))
    .limit(NEW_CREATORS_POOL);
  const campaignSide = {
    targetIndustries: activeCampaign?.brief.targetIndustries ?? brand?.targetIndustries ?? [],
    icpTitles: (brand?.icps ?? []).map((i) => i.title),
  };
  const newCreators = candidates
    .map((c) => ({
      id: c.creator.id,
      name: `${c.firstName} ${c.lastName}`,
      avatarUrl: c.creator.avatarUrl,
      industries: c.creator.industries,
      priceCents: c.creator.priceCents,
      fit: fitScore(c.creator, campaignSide).score,
    }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, NEW_CREATORS_LIMIT);

  return {
    creatorsActivated: counts?.activated ?? 0,
    postsPublished: counts?.published ?? 0,
    profilesEngaged: engaged?.n ?? 0,
    impressions: counts?.impressions ?? 0,
    draftsToReview: counts?.drafts ?? 0,
    applicationsReceived: counts?.applied ?? 0,
    messagesThisWeek: recentMessages?.n ?? 0,
    activeCampaign: activeCampaign ? { id: activeCampaign.id, name: activeCampaign.name } : null,
    newCreators,
  };
}



// Sum of estimated impressions of published sponsored posts, per creator.

export const ACTIVATED_STATUSES = ACTIVATED;

// The two dashboard overviews, and the leaderboard everyone shares.
export function getBrandOverview(brandId: string) {
  return cachedRead(loadBrandOverview, ["brand-overview"], { tags: [tag.brandOverview(brandId)] })(brandId);
}


