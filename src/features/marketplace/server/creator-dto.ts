import "server-only";
import type { creatorPosts, creators } from "@/db/schema";
import { cpmCents } from "@/lib/cpm";
import { type EngagementBaseline, type FitCampaign, fitScore } from "@/lib/fit-score";
import { ENGAGER_SAMPLE_MAX, ENGAGER_SAMPLE_MIN, ENGAGER_SAMPLE_RATE } from "../constants";
import type { CreatorDto, CreatorPostDto } from "../schemas";

type CreatorRow = typeof creators.$inferSelect;
type PostRow = typeof creatorPosts.$inferSelect;

export type CreatorRowWithName = { creator: CreatorRow; firstName: string; lastName: string };

export type CreatorDtoContext = {
  campaign: FitCampaign;
  /** Our own creators' engagement medians (engagement-baseline.ts). */
  baseline: EngagementBaseline;
  shortlistedIds: Set<string>;
  collaborationStatusByCreator: Map<string, string>;
  postsByCreator: Map<string, PostRow[]>;
};

// "Estimated from N recent public engagers": the audience mix is a sample of
// the people who reacted recently, sized from the creator's typical reach.
function engagerSample(medianViews: number) {
  return Math.min(ENGAGER_SAMPLE_MAX, Math.max(ENGAGER_SAMPLE_MIN, Math.round(medianViews * ENGAGER_SAMPLE_RATE)));
}

export function toPostDto(row: PostRow): CreatorPostDto {
  return {
    id: row.id,
    url: row.url,
    body: row.body,
    impressions: row.impressions,
    reactions: row.reactions,
    comments: row.comments,
    reposts: row.reposts,
    postedAt: row.postedAt.toISOString(),
  };
}

export function toCreatorDto(row: CreatorRowWithName, ctx: CreatorDtoContext): CreatorDto {
  const c = row.creator;
  const posts = (ctx.postsByCreator.get(c.id) ?? [])
    .slice()
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .map(toPostDto);
  const bundle = c.bundles[0] ?? null;
  return {
    id: c.id,
    name: `${row.firstName} ${row.lastName}`.trim(),
    handle: c.handle,
    avatarUrl: c.avatarUrl,
    linkedinUrl: c.linkedinUrl,
    xHandle: c.xHandle,
    memberSince: c.createdAt.toISOString(),
    headline: c.headline,
    bio: c.bio,
    country: c.country,
    industries: c.industries,
    followers: c.followers,
    medianViews: c.medianViews,
    engagementRate: c.engagementRate,
    postsPerMonth: c.postsPerMonth,
    priceCents: c.priceCents,
    bundle: bundle ? { posts: bundle.posts, totalCents: bundle.totalCents } : null,
    cpmCents: cpmCents(c.priceCents, c.medianViews),
    audienceJobTitles: c.audienceJobTitles,
    audienceSeniority: c.audienceSeniority,
    engagerSample: engagerSample(c.medianViews),
    posts,
    fit: fitScore(
      {
        industries: c.industries,
        audienceJobTitles: c.audienceJobTitles,
        followers: c.followers,
        engagementRate: c.engagementRate,
        postsPerMonth: c.postsPerMonth,
      },
      ctx.campaign,
      ctx.baseline,
    ),
    shortlisted: ctx.shortlistedIds.has(c.id),
    collaborationStatus: ctx.collaborationStatusByCreator.get(c.id) ?? null,
  };
}
