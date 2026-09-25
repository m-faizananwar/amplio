import "server-only";

import { desc, eq } from "drizzle-orm";
import { creators, users } from "@/db/schema";
import { getDb, isDbConfigured } from "@/db";
import { fitScore } from "@/lib/fit-score";
import { getEngagementBaseline } from "@/features/marketplace/server/engagement-baseline";
import {
  type PublicCreator,
  SHOWCASE_BRIEF,
  SHOWCASE_CANDIDATES,
  SHOWCASE_COUNT,
} from "../constants";

// The public pages must render without a database: every query returns []
// when DATABASE_URL is missing or the read fails, and the section hides or
// falls back to its static state.

export async function getShowcaseCreators(): Promise<PublicCreator[]> {
  if (!isDbConfigured()) return [];
  try {
    const rows = await getDb()
      .select({
        id: creators.id,
        firstName: users.firstName,
        lastName: users.lastName,
        industries: creators.industries,
        country: creators.country,
        headline: creators.headline,
        followers: creators.followers,
        medianViews: creators.medianViews,
        priceCents: creators.priceCents,
        engagementRate: creators.engagementRate,
        postsPerMonth: creators.postsPerMonth,
        audienceJobTitles: creators.audienceJobTitles,
        avatarUrl: creators.avatarUrl,
      })
      .from(creators)
      .innerJoin(users, eq(users.id, creators.userId))
      .orderBy(desc(creators.medianViews))
      .limit(SHOWCASE_CANDIDATES);
    const brief = { targetIndustries: [...SHOWCASE_BRIEF.targetIndustries], icpTitles: [...SHOWCASE_BRIEF.icpTitles] };
    const baseline = await getEngagementBaseline();
    return rows
      .map((row) => ({
        id: row.id,
        name: `${row.firstName} ${row.lastName}`,
        industries: row.industries,
        country: row.country,
        headline: row.headline,
        fit: fitScore(row, brief, baseline).score,
        followers: row.followers,
        medianViews: row.medianViews,
        priceCents: row.priceCents,
        avatarUrl: row.avatarUrl,
      }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, SHOWCASE_COUNT);
  } catch (error) {
    console.error("[public] getShowcaseCreators failed", error);
    return [];
  }
}
