import "server-only";
import { and, count, desc, eq, gte, inArray, notInArray, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import {
  brands, campaigns, clicks, collaborations, creatorPosts, creators, messages, pixelEvents, shortlist, trackingLinks, users,
} from "@/db/schema";
import { fitScore } from "@/lib/fit-score";
import { NEW_CREATORS_LIMIT, NEW_CREATORS_POOL, RECOMMENDED_OPPORTUNITIES } from "../constants";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

const DAY_MS = 86_400_000;
const RECENT_DAYS = 7;
const ACTIVATED = ["accepted", "draft_submitted", "changes_requested", "approved", "scheduled", "live", "paid"] as const;
const PUBLISHED = ["live", "paid"] as const;

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

export type CreatorOverview = {
  reach: number;
  posts: number;
  engagements: number;
  followers: number;
  card: { name: string; headline: string; industries: string[]; country: string; avatarUrl: string; followers: number; medianViews: number; priceCents: number; bundle: { posts: number; totalCents: number } | null };
  recommended: Array<{ campaignId: string; brand: string; name: string; fit: number; postDeadline: string | null }>;
  active: Array<{ id: string; brand: string; campaign: string; status: string; dueDate: string | null; feeCents: number }>;
};

async function loadCreatorOverview(creatorId: string): Promise<CreatorOverview> {
  const db = getDb();
  const [row] = await db
    .select({ creator: creators, firstName: users.firstName, lastName: users.lastName })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(eq(creators.id, creatorId));
  if (!row) throw new Error("creator not found");
  const [postAgg] = await db
    .select({
      posts: count(),
      reach: sql<number>`coalesce(sum(${creatorPosts.impressions}), 0)::int`,
      engagements: sql<number>`coalesce(sum(${creatorPosts.reactions} + ${creatorPosts.comments} + ${creatorPosts.reposts}), 0)::int`,
    })
    .from(creatorPosts)
    .where(eq(creatorPosts.creatorId, creatorId));

  const mine = db.select({ campaignId: collaborations.campaignId }).from(collaborations).where(eq(collaborations.creatorId, creatorId));
  const open = await db
    .select({ campaign: campaigns, brand: brands })
    .from(campaigns)
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(and(eq(campaigns.status, "active"), eq(campaigns.openToApplications, true), notInArray(campaigns.id, mine)));
  const recommended = open
    .map((o) => ({
      campaignId: o.campaign.id,
      brand: o.brand.company,
      name: o.campaign.name,
      postDeadline: o.campaign.postDeadline?.toISOString() ?? null,
      fit: fitScore(row.creator, { targetIndustries: o.campaign.brief.targetIndustries, icpTitles: o.brand.icps.map((i) => i.title) }).score,
    }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, RECOMMENDED_OPPORTUNITIES);

  const active = await db
    .select({ id: collaborations.id, brand: brands.company, campaign: campaigns.name, status: collaborations.status, dueDate: collaborations.dueDate, feeCents: collaborations.feeCents })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(and(eq(collaborations.creatorId, creatorId), notInArray(collaborations.status, ["declined", "paid"])))
    .orderBy(desc(collaborations.updatedAt));

  return {
    reach: postAgg?.reach ?? 0,
    posts: postAgg?.posts ?? 0,
    engagements: postAgg?.engagements ?? 0,
    followers: row.creator.followers,
    card: {
      name: `${row.firstName} ${row.lastName}`,
      headline: row.creator.headline,
      industries: row.creator.industries,
      country: row.creator.country,
      avatarUrl: row.creator.avatarUrl,
      followers: row.creator.followers,
      medianViews: row.creator.medianViews,
      priceCents: row.creator.priceCents,
      bundle: row.creator.bundles[0] ?? null,
    },
    recommended,
    active: active.map((a) => ({ ...a, dueDate: a.dueDate?.toISOString() ?? null })),
  };
}

// Sum of estimated impressions of published sponsored posts, per creator.

export const ACTIVATED_STATUSES = ACTIVATED;

// The two dashboard overviews, and the leaderboard everyone shares.
export function getBrandOverview(brandId: string) {
  return cachedRead(loadBrandOverview, ["brand-overview"], { tags: [tag.brandOverview(brandId)] })(brandId);
}

export function getCreatorOverview(creatorId: string) {
  return cachedRead(loadCreatorOverview, ["creator-overview"], { tags: [tag.creatorOverview(creatorId)] })(creatorId);
}

