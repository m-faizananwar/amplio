import "server-only";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, campaigns, clicks, collaborations, creatorPosts, creators, trackingLinks } from "@/db/schema";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";
import { deviceOf, referrerHost, type Device } from "@/lib/click-source";

export type PublicSnapshot = {
  followers: number;
  posts: number;
  reach: number;
  engagements: number;
  postsWithReach: number;
};
export type PublicPostDto = {
  id: string;
  url: string;
  body: string;
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  postedAt: string;
};
export type TrackedLinkPerformance = {
  collaborationId: string;
  brand: string;
  campaign: string;
  status: string;
  code: string;
  clicks: number;
  publishedAt: string | null;
};

// One click on one of the creator's tracked links: the rows behind the
// "clicks" number. Raw facts only; the view turns them into trail rows so
// device and "direct" read in the viewer's language.
export type CreatorClickRow = {
  id: string;
  at: string;
  collaborationId: string;
  campaign: string;
  brand: string;
  referrer: string | null;
  device: Device;
  country: string | null;
};
// Enough rows to read in a drawer; the total on the card is counted separately.
export const CLICK_TRAIL_LIMIT = 500;

export const ANALYTICS_RANGES = ["all", "30", "90"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
const DAY_MS = 86_400_000;

function sinceFor(range: AnalyticsRange) {
  return range === "all" ? null : new Date(Date.now() - Number(range) * DAY_MS);
}

async function loadPublicSnapshot(creatorId: string, range: AnalyticsRange = "all"): Promise<PublicSnapshot> {
  const db = getDb();
  const since = sinceFor(range);
  const [creator] = await db.select({ followers: creators.followers }).from(creators).where(eq(creators.id, creatorId));
  const [agg] = await db
    .select({
      posts: count(),
      reach: sql<number>`coalesce(sum(${creatorPosts.impressions}), 0)::int`,
      engagements: sql<number>`coalesce(sum(${creatorPosts.reactions} + ${creatorPosts.comments} + ${creatorPosts.reposts}), 0)::int`,
      withReach: sql<number>`count(*) filter (where ${creatorPosts.impressions} > 0)::int`,
    })
    .from(creatorPosts)
    .where(and(eq(creatorPosts.creatorId, creatorId), since ? gte(creatorPosts.postedAt, since) : undefined));
  return {
    followers: creator?.followers ?? 0,
    posts: agg?.posts ?? 0,
    reach: agg?.reach ?? 0,
    engagements: agg?.engagements ?? 0,
    postsWithReach: agg?.withReach ?? 0,
  };
}

async function loadPublicPosts(creatorId: string, range: AnalyticsRange = "all"): Promise<PublicPostDto[]> {
  const since = sinceFor(range);
  const rows = await getDb()
    .select()
    .from(creatorPosts)
    .where(and(eq(creatorPosts.creatorId, creatorId), since ? gte(creatorPosts.postedAt, since) : undefined))
    .orderBy(desc(creatorPosts.postedAt));
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    body: r.body,
    impressions: r.impressions,
    reactions: r.reactions,
    comments: r.comments,
    reposts: r.reposts,
    postedAt: r.postedAt.toISOString(),
  }));
}

async function loadTrackedLinkPerformance(creatorId: string): Promise<TrackedLinkPerformance[]> {
  const rows = await getDb()
    .select({
      collaborationId: collaborations.id,
      brand: brands.company,
      campaign: campaigns.name,
      status: collaborations.status,
      code: trackingLinks.code,
      clicks: count(clicks.id),
      publishedAt: collaborations.publishedAt,
    })
    .from(collaborations)
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .innerJoin(trackingLinks, eq(trackingLinks.collaborationId, collaborations.id))
    .leftJoin(clicks, eq(clicks.trackingLinkId, trackingLinks.id))
    .where(and(eq(collaborations.creatorId, creatorId), inArray(collaborations.status, ["accepted", "draft_submitted", "changes_requested", "approved", "scheduled", "live", "paid"])))
    .groupBy(collaborations.id, brands.company, campaigns.name, collaborations.status, trackingLinks.code, collaborations.publishedAt)
    .orderBy(desc(count(clicks.id)));
  return rows.map((r) => ({ ...r, publishedAt: r.publishedAt?.toISOString() ?? null }));
}

async function loadCreatorClicks(creatorId: string, range: AnalyticsRange = "all"): Promise<CreatorClickRow[]> {
  const db = getDb();
  const since = sinceFor(range);
  const rows = await db
    .select({
      id: clicks.id,
      at: clicks.clickedAt,
      collaborationId: collaborations.id,
      campaign: campaigns.name,
      brand: brands.company,
      referrer: clicks.referrer,
      userAgent: clicks.userAgent,
      country: clicks.country,
    })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .innerJoin(campaigns, eq(campaigns.id, collaborations.campaignId))
    .innerJoin(brands, eq(brands.id, campaigns.brandId))
    .where(since ? and(eq(collaborations.creatorId, creatorId), gte(clicks.clickedAt, since)) : eq(collaborations.creatorId, creatorId))
    .orderBy(desc(clicks.clickedAt))
    .limit(CLICK_TRAIL_LIMIT);
  return rows.map(({ userAgent, referrer, at, ...r }) => ({ ...r, at: at.toISOString(), referrer: referrerHost(referrer), device: deviceOf(userAgent) }));
}

// The creator's own analytics: clicks on their links, and their posts.
export function getPublicSnapshot(creatorId: string, range: AnalyticsRange = "all") {
  return cachedRead(loadPublicSnapshot, ["public-snapshot"], { tags: [tag.creatorAnalytics(creatorId)] })(creatorId, range);
}

export function getPublicPosts(creatorId: string, range: AnalyticsRange = "all") {
  return cachedRead(loadPublicPosts, ["public-posts"], { tags: [tag.creatorAnalytics(creatorId)] })(creatorId, range);
}

export function getTrackedLinkPerformance(creatorId: string) {
  return cachedRead(loadTrackedLinkPerformance, ["tracked-link-performance"], { tags: [tag.creatorAnalytics(creatorId)] })(creatorId);
}

export function listCreatorClicks(creatorId: string, range: AnalyticsRange = "all") {
  return cachedRead(loadCreatorClicks, ["creator-clicks"], { tags: [tag.creatorAnalytics(creatorId)] })(creatorId, range);
}
