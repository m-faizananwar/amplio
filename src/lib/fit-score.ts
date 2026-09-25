// The matching engine, as a pure function: audience fit before follower
// count. Every score comes with its signals and a one-line "why they belong".

export type AudienceMix = Record<string, number>;

export type FitCreator = {
  industries: string[];
  audienceJobTitles: AudienceMix;
  followers: number;
  engagementRate: number; // 0..1
  postsPerMonth: number;
};

export type FitCampaign = {
  targetIndustries: string[];
  // Free-text ICP titles from the brand ("Founder / CEO of early-stage SaaS").
  icpTitles: string[];
};

export type FitSignal = { key: "audience" | "category" | "engagement" | "consistency"; label: string; score: number; weight: number; detail: string };
export type FitResult = { score: number; signals: FitSignal[]; reason: string };

export const FIT_WEIGHTS = { audience: 0.4, category: 0.3, engagement: 0.2, consistency: 0.1 } as const;

// Job-title buckets used by the seed's audience mixes.
const BUCKET_KEYWORDS: Array<[bucket: string, keywords: string[]]> = [
  ["Founders", ["founder", "ceo", "co-founder", "cofounder", "owner", "entrepreneur"]],
  ["Marketing", ["marketing", "growth", "gtm", "brand", "demand", "content", "seo"]],
  ["Sales", ["sales", "sdr", "bdr", "ae", "account executive", "revenue", "revops", "outbound", "business development"]],
  ["Engineering", ["cto", "engineer", "engineering", "developer", "tech lead", "architect"]],
  ["Product", ["product", "cpo", "ux", "design"]],
  ["HR", ["hr", "people", "talent", "recruit"]],
  ["Finance", ["finance", "cfo", "controller", "accounting"]],
  ["Operations", ["operations", "ops", "support", "customer success", "coo", "office"]],
];

// Engagement is naturally higher for smaller accounts, so "quality" is judged
// against creators of the same size — on Amplio. The tiers are fixed; the
// rate for each is the median engagement of our own creators in that tier
// (marketplace/server/engagement-baseline.ts), not a published benchmark.
export const ENGAGEMENT_TIERS = [
  { maxFollowers: 3_000 },
  { maxFollowers: 7_000 },
  { maxFollowers: 10_000 },
  { maxFollowers: 100_000 },
  { maxFollowers: Infinity },
] as const;

/** Median engagement rate per tier, in ENGAGEMENT_TIERS order; null where we have too few creators. */
export type EngagementBaseline = { byTier: Array<number | null>; overall: number | null };

export function tierIndex(followers: number) {
  const index = ENGAGEMENT_TIERS.findIndex((tier) => followers <= tier.maxFollowers);
  return index < 0 ? ENGAGEMENT_TIERS.length - 1 : index;
}

const LIMITS = { consistentPostsPerMonth: 8, strongAudienceOverlap: 50, atBenchmarkScore: 70 };
const PERCENT = 100;

export function icpBuckets(titles: string[]): string[] {
  const found = new Set<string>();
  for (const title of titles) {
    const lower = title.toLowerCase();
    for (const [bucket, keywords] of BUCKET_KEYWORDS) {
      if (keywords.some((k) => lower.includes(k))) found.add(bucket);
    }
  }
  return [...found];
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(PERCENT, Math.round(value)));
}

function audienceSignal(creator: FitCreator, campaign: FitCampaign): FitSignal {
  const buckets = icpBuckets(campaign.icpTitles);
  const overlap = buckets.reduce((sum, b) => sum + (creator.audienceJobTitles[b] ?? 0), 0);
  const top = buckets
    .map((b) => [b, creator.audienceJobTitles[b] ?? 0] as const)
    .sort((a, b) => b[1] - a[1])[0];
  // A 50% overlap with the buyer already counts as a strong fit.
  const score = clampPercent((overlap / LIMITS.strongAudienceOverlap) * PERCENT);
  const detail =
    buckets.length === 0
      ? "No ICP titles on the campaign yet"
      : top && top[1] > 0
        ? `${top[1]}% of their audience are ${top[0]} — your ICP`
        : `Their audience rarely includes ${buckets.join(" / ")}`;
  return { key: "audience", label: "Audience overlap", score, weight: FIT_WEIGHTS.audience, detail };
}

function categorySignal(creator: FitCreator, campaign: FitCampaign): FitSignal {
  const target = new Set(campaign.targetIndustries);
  const matched = creator.industries.filter((i) => target.has(i));
  const denominator = Math.max(1, Math.min(creator.industries.length, target.size));
  const score = clampPercent((matched.length / denominator) * PERCENT);
  const detail = matched.length > 0 ? `Already writes about ${matched.join(", ")}` : "Writes about other categories";
  return { key: "category", label: "Category match", score, weight: FIT_WEIGHTS.category, detail };
}

function engagementSignal(creator: FitCreator, baseline: EngagementBaseline | undefined): FitSignal {
  const tierRate = baseline?.byTier[tierIndex(creator.followers)] ?? null;
  const reference = tierRate ?? baseline?.overall ?? null;
  const rate = `${(creator.engagementRate * PERCENT).toFixed(1)}%`;
  const base = { key: "engagement" as const, label: "Engagement quality", weight: FIT_WEIGHTS.engagement };
  if (creator.engagementRate <= 0) return { ...base, score: 0, detail: "No engagement measured yet" };
  // No reference yet (an empty marketplace): a neutral score, and the detail says why.
  if (!reference) return { ...base, score: LIMITS.atBenchmarkScore, detail: `${rate} engagement, nothing on Amplio to compare it with yet` };
  // At the median = 70, 1.5× the median = 100.
  const score = clampPercent((creator.engagementRate / reference) * LIMITS.atBenchmarkScore);
  const scope = tierRate === null ? "on Amplio" : "for creators their size on Amplio";
  return { ...base, score, detail: `${rate} engagement vs a ${(reference * PERCENT).toFixed(1)}% median ${scope}` };
}

function consistencySignal(creator: FitCreator): FitSignal {
  const score = clampPercent((creator.postsPerMonth / LIMITS.consistentPostsPerMonth) * PERCENT);
  return {
    key: "consistency",
    label: "Posting consistency",
    score,
    weight: FIT_WEIGHTS.consistency,
    detail: `${creator.postsPerMonth.toFixed(0)} posts a month`,
  };
}

function reasonFor(signals: FitSignal[]) {
  const [best, second] = [...signals].sort((a, b) => b.score * b.weight - a.score * a.weight);
  const first = best.detail.charAt(0).toUpperCase() + best.detail.slice(1);
  return second ? `${first}, and ${second.detail.charAt(0).toLowerCase()}${second.detail.slice(1)}.` : `${first}.`;
}

export function fitScore(creator: FitCreator, campaign: FitCampaign, baseline?: EngagementBaseline): FitResult {
  const signals = [audienceSignal(creator, campaign), categorySignal(creator, campaign), engagementSignal(creator, baseline), consistencySignal(creator)];
  const score = clampPercent(signals.reduce((sum, s) => sum + s.score * s.weight, 0));
  return { score, signals, reason: reasonFor(signals) };
}
