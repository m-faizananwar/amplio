import "server-only";
import { DEMO_DOMAINS } from "@/features/auth/constants";
import { isSeededEmail } from "@/lib/seeded";
import { profileSource, type ProfileSource } from "@/lib/profile-source";
import { count, eq, inArray, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { collaborations, creatorPosts, creators, users } from "@/db/schema";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

export type PublicCard = {
  handle: string;
  name: string;
  headline: string;
  bio: string;
  industries: string[];
  country: string;
  avatarUrl: string;
  followers: number;
  medianViews: number;
  priceCents: number;
  bundle: { posts: number; totalCents: number } | null;
  engagementRate: number;
  audienceJobTitles: Record<string, number>;
  audienceSeniority: Record<string, number>;
  postsAnalyzed: number;
  reactionsPerPost: number;
  commentsPerPost: number;
  publishedCollaborations: number;
  /** Seeded demo creator: labelled wherever the card is public. */
  seeded: boolean;
  /** Where the figures came from: demo data, the LinkedIn read, or by hand. */
  source: ProfileSource;
};

async function loadPublicCard(handle: string): Promise<PublicCard | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const [row] = await db
    .select({ creator: creators, firstName: users.firstName, lastName: users.lastName, email: users.email })
    .from(creators)
    .innerJoin(users, eq(users.id, creators.userId))
    .where(eq(creators.handle, handle));
  if (!row) return null;
  const [posts] = await db
    .select({
      n: count(),
      reactions: sql<number>`coalesce(avg(${creatorPosts.reactions}), 0)::int`,
      comments: sql<number>`coalesce(avg(${creatorPosts.comments}), 0)::int`,
    })
    .from(creatorPosts)
    .where(eq(creatorPosts.creatorId, row.creator.id));
  const [published] = await db
    .select({ n: count() })
    .from(collaborations)
    .where(sql`${collaborations.creatorId} = ${row.creator.id} and ${inArray(collaborations.status, ["live", "paid"])}`);
  return {
    handle: row.creator.handle,
    name: `${row.firstName} ${row.lastName}`,
    headline: row.creator.headline,
    bio: row.creator.bio,
    industries: row.creator.industries,
    country: row.creator.country,
    avatarUrl: row.creator.avatarUrl,
    followers: row.creator.followers,
    medianViews: row.creator.medianViews,
    priceCents: row.creator.priceCents,
    bundle: row.creator.bundles[0] ?? null,
    engagementRate: row.creator.engagementRate,
    audienceJobTitles: row.creator.audienceJobTitles,
    audienceSeniority: row.creator.audienceSeniority,
    postsAnalyzed: posts?.n ?? 0,
    reactionsPerPost: posts?.reactions ?? 0,
    commentsPerPost: posts?.comments ?? 0,
    publishedCollaborations: published?.n ?? 0,
    seeded: isSeededEmail(row.email, DEMO_DOMAINS),
    source: profileSource({ seeded: isSeededEmail(row.email, DEMO_DOMAINS), followers: row.creator.followers }),
  };
}

// The public creator card. Keyed by handle, dropped with the directory when a
// creator edits their profile.
export function getPublicCard(handle: string) {
  return cachedRead(loadPublicCard, ["public-card"], { tags: [tag.creatorDirectory()] })(handle);
}
