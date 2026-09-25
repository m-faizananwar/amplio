// Constants for the public site's reads: the showcase creators (the demo
// creator on /for-creators) and the landing's live trail. Copy lives in
// messages/{en,fr}/{landing,public}.json.

export const SHOWCASE_BRIEF = {
  targetIndustries: ["B2B", "SaaS", "AI"],
  icpTitles: ["Founder / CEO of early-stage SaaS", "Head of Sales", "VP Marketing"],
} as const;

export const SHOWCASE_CANDIDATES = 120;

export const SHOWCASE_COUNT = 6;

export type PublicCreator = {
  id: string;
  name: string;
  industries: string[];
  country: string;
  headline: string;
  fit: number;
  followers: number;
  medianViews: number;
  priceCents: number;
  avatarUrl: string | null;
};

export const TRAIL_TTL_S = 60;

export type PublicTrail = { example: { feeCents: number; clicks: number; signups: number } | null; posts: number; links: number; clicks: number; signups: number; paidPosts: number; paidCents: number; lastClickAt: string | null; asOf: string };
