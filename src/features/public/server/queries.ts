import "server-only";

import { desc, eq } from "drizzle-orm";
import { creatorPosts, creators, users } from "@/db/schema";
import { getDb, isDbConfigured } from "@/db";
import { fitScore } from "@/lib/fit-score";
import {
  POST_EXAMPLES_CANDIDATES,
  POST_EXAMPLES_COUNT,
  type PublicCreator,
  type PublicPost,
  SHOWCASE_BRIEF,
  SHOWCASE_CANDIDATES,
  SHOWCASE_COUNT,
} from "../constants";

// The public pages must render without a database: every query returns []
// when DATABASE_URL is missing or the read fails, and the section hides or
// falls back to its static state.

function firstLine(body: string) {
  return body.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
}

function toPostDto(row: {
  id: string;
  url: string;
  body: string;
  impressions: number;
  firstName: string;
  lastName: string;
  industries: string[];
  followers: number;
  avatarUrl: string;
}): PublicPost {
  const followersK = Math.round(row.followers / 1000);
  return {
    id: row.id,
    url: row.url,
    title: firstLine(row.body),
    creatorName: `${row.firstName} ${row.lastName}`,
    creatorLine: `Creator · ${row.industries.slice(0, 2).join(" & ")} · ${followersK}K followers`,
    avatarUrl: row.avatarUrl,
    impressions: row.impressions,
  };
}

// One post per creator: the top posts by impressions cluster on the biggest
// account, and the section is meant to show four different voices.
function onePerCreator<T extends { creatorId: string }>(rows: T[], count: number): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => (seen.has(row.creatorId) ? false : seen.add(row.creatorId))).slice(0, count);
}

export async function getTopPosts(): Promise<PublicPost[]> {
  if (!isDbConfigured()) return [];
  try {
    const rows = await getDb()
      .select({
        id: creatorPosts.id,
        creatorId: creatorPosts.creatorId,
        url: creatorPosts.url,
        body: creatorPosts.body,
        impressions: creatorPosts.impressions,
        firstName: users.firstName,
        lastName: users.lastName,
        industries: creators.industries,
        followers: creators.followers,
        avatarUrl: creators.avatarUrl,
      })
      .from(creatorPosts)
      .innerJoin(creators, eq(creators.id, creatorPosts.creatorId))
      .innerJoin(users, eq(users.id, creators.userId))
      .orderBy(desc(creatorPosts.impressions))
      .limit(POST_EXAMPLES_CANDIDATES);
    return onePerCreator(rows, POST_EXAMPLES_COUNT).map(toPostDto);
  } catch (error) {
    console.error("[public] getTopPosts failed", error);
    return [];
  }
}

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
    return rows
      .map((row) => ({
        id: row.id,
        name: `${row.firstName} ${row.lastName}`,
        industries: row.industries,
        country: row.country,
        headline: row.headline,
        fit: fitScore(row, brief).score,
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
