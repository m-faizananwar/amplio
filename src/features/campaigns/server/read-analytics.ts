import "server-only";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { clicks, collaborations, creators, ledgerEntries, trackingLinks, users } from "@/db/schema";
import { ANALYTICS_DAYS, DAY_MS } from "../constants";
import type { AnalyticsDto } from "../schemas";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

const PUBLISHED: readonly string[] = ["live", "paid"];

function dayKey(date: Date) {
  return date.toISOString().slice(0, "yyyy-mm-dd".length);
}

// Daily clicks for the last N days, zero-filled so the chart has every day.
async function dailyClicks(campaignId: string) {
  const since = new Date(Date.now() - (ANALYTICS_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await getDb()
    .select({ day: sql<string>`to_char(${clicks.clickedAt} at time zone 'UTC', 'YYYY-MM-DD')`, n: sql<number>`count(*)::int` })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .where(and(eq(collaborations.campaignId, campaignId), gte(clicks.clickedAt, since)))
    .groupBy(sql`1`);
  const byDay = new Map(rows.map((r) => [r.day, r.n]));
  return Array.from({ length: ANALYTICS_DAYS }, (_, i) => {
    const day = dayKey(new Date(since.getTime() + i * DAY_MS));
    return { day, clicks: byDay.get(day) ?? 0 };
  });
}

async function loadCampaignClickCount(campaignId: string): Promise<number> {
  const [row] = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(clicks)
    .innerJoin(trackingLinks, eq(trackingLinks.id, clicks.trackingLinkId))
    .innerJoin(collaborations, eq(collaborations.id, trackingLinks.collaborationId))
    .where(eq(collaborations.campaignId, campaignId));
  return row?.n ?? 0;
}

type AnalyticsRow = {
  collaborationId: string;
  status: string;
  postUrl: string | null;
  publishedAt: Date | null;
  creatorId: string;
  avatarUrl: string;
  medianViews: number;
  firstName: string;
  lastName: string;
  clicks: number;
};

// One row per collaboration with its click count (0 when it has no link yet).
async function collaborationRows(campaignId: string): Promise<AnalyticsRow[]> {
  const db = getDb();
  const clicksPerCollab = db
    .select({ collaborationId: trackingLinks.collaborationId, n: sql<number>`count(${clicks.id})::int`.as("n") })
    .from(trackingLinks)
    .leftJoin(clicks, eq(clicks.trackingLinkId, trackingLinks.id))
    .groupBy(trackingLinks.collaborationId)
    .as("clicks_per_collab");
  return db
    .select({
      collaborationId: collaborations.id,
      status: collaborations.status,
      postUrl: collaborations.postUrl,
      publishedAt: collaborations.publishedAt,
      creatorId: creators.id,
      avatarUrl: creators.avatarUrl,
      medianViews: creators.medianViews,
      firstName: users.firstName,
      lastName: users.lastName,
      clicks: sql<number>`coalesce(${clicksPerCollab.n}, 0)::int`,
    })
    .from(collaborations)
    .innerJoin(creators, eq(creators.id, collaborations.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .leftJoin(clicksPerCollab, eq(clicksPerCollab.collaborationId, collaborations.id))
    .where(eq(collaborations.campaignId, campaignId))
    .orderBy(desc(sql`coalesce(${clicksPerCollab.n}, 0)`));
}

async function committedBudget(campaignId: string) {
  const [budget] = await getDb()
    .select({ cents: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}), 0)::int`, n: sql<number>`count(*)::int` })
    .from(ledgerEntries)
    .innerJoin(collaborations, eq(collaborations.id, ledgerEntries.collaborationId))
    .where(and(eq(collaborations.campaignId, campaignId), eq(ledgerEntries.type, "booking")));
  return { committedCents: budget?.cents ?? 0, bookings: budget?.n ?? 0 };
}

async function loadCampaignAnalytics(campaignId: string): Promise<AnalyticsDto> {
  const [rows, budget, daily] = await Promise.all([collaborationRows(campaignId), committedBudget(campaignId), dailyClicks(campaignId)]);
  const published = rows.filter((r) => PUBLISHED.includes(r.status) && r.postUrl && r.publishedAt);
  const nameOf = (r: AnalyticsRow) => `${r.firstName} ${r.lastName}`.trim();
  return {
    estReach: published.reduce((sum, r) => sum + r.medianViews, 0),
    publishedPosts: published.length,
    qualifiedClicks: rows.reduce((sum, r) => sum + r.clicks, 0),
    ...budget,
    daily,
    byCreator: rows.filter((r) => r.clicks > 0).map((r) => ({ creatorId: r.creatorId, creatorName: nameOf(r), avatarUrl: r.avatarUrl, clicks: r.clicks })),
    posts: published.map((r) => ({
      collaborationId: r.collaborationId,
      creatorName: nameOf(r),
      postUrl: r.postUrl as string,
      publishedAt: (r.publishedAt as Date).toISOString(),
      clicks: r.clicks,
    })),
  };
}

// Campaign analytics: clicks land here too, so the results tag joins the key.
export function getCampaignClickCount(campaignId: string) {
  return cachedRead(loadCampaignClickCount, ["campaign-click-count"], { tags: [tag.campaign(campaignId)] })(campaignId);
}

export function getCampaignAnalytics(campaignId: string) {
  return cachedRead(loadCampaignAnalytics, ["campaign-analytics"], { tags: [tag.campaign(campaignId)] })(campaignId);
}
