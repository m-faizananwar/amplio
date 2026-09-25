import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cachedRead } from "@/db/cache";
import { creators } from "@/db/schema";
import { tag } from "@/lib/cache-tags";
import { ENGAGEMENT_TIERS, type EngagementBaseline, tierIndex } from "@/lib/fit-score";

// A tier needs this many creators before its median means anything.
const MIN_PER_TIER = 5;

// Median engagement of Amplio's own creators, per follower tier and overall:
// the reference the fit score's engagement signal is measured against.
async function loadEngagementBaseline(): Promise<EngagementBaseline> {
  const rows = await getDb()
    .select({ followers: creators.followers, rate: creators.engagementRate })
    .from(creators)
    .where(sql`${creators.engagementRate} > 0`);
  const tiers: number[][] = ENGAGEMENT_TIERS.map(() => []);
  for (const row of rows) tiers[tierIndex(row.followers)].push(row.rate);
  return {
    byTier: tiers.map((rates) => (rates.length >= MIN_PER_TIER ? median(rates) : null)),
    overall: rows.length >= MIN_PER_TIER ? median(rows.map((r) => r.rate)) : null,
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// A creator edit (the directory tag) is the only thing that moves it.
export function getEngagementBaseline(): Promise<EngagementBaseline> {
  return cachedRead(loadEngagementBaseline, ["engagement-baseline"], { tags: [tag.creatorDirectory()] })();
}
