// Pre-spend campaign estimator, from our own marketplace only.
//
// The first version multiplied a selection by another company's published
// benchmark (CTR by follower tier, CPL by vertical). Those were their numbers,
// not ours. This one derives two rates from collaborations that actually went
// live on Amplio — clicks per view, and sign-ups per click — and says so, with
// the sample size. Below a minimum sample it returns null for that part and
// the UI says "not enough data yet" instead of inventing a figure. Pure.

export type EstimatorCreator = { followers: number; medianViews: number; priceCents: number };

/** What the marketplace has observed so far (src/features/campaigns/server/read-rates.ts). */
export type ObservedSample = {
  /** Collaborations that went live (or were paid) with a tracked link. */
  livePosts: number;
  /** Sum of those creators' median views: the reach the clicks came from. */
  views: number;
  /** Clicks on those tracked links. */
  clicks: number;
  /** Sign-ups the pixel attributed to those clicks. */
  signups: number;
};

export type Confidence = "high" | "medium" | "low";

export type Estimate = {
  creators: number;
  creatorsWithReach: number;
  totalSpendCents: number;
  /** Clicks per view, or null below MIN_LIVE_POSTS. */
  clickRate: number | null;
  /** Sign-ups per click, or null below MIN_CLICKS_FOR_LEADS. */
  leadRate: number | null;
  estClicks: number | null;
  estLeads: number | null;
  estCpcCents: number | null;
  estCplCents: number | null;
  sample: ObservedSample;
  /** From the size of the sample the rates came from — not from the selection. */
  confidence: Confidence | null;
};

export const MIN_LIVE_POSTS = 3;
export const MIN_CLICKS_FOR_LEADS = 30;
const CONFIDENCE_POSTS = { high: 20, medium: 8 };

export function ratesFrom(sample: ObservedSample) {
  const clickRate = sample.livePosts >= MIN_LIVE_POSTS && sample.views > 0 ? sample.clicks / sample.views : null;
  const leadRate = sample.clicks >= MIN_CLICKS_FOR_LEADS ? sample.signups / sample.clicks : null;
  return { clickRate, leadRate };
}

export function confidenceFor(sample: ObservedSample): Confidence | null {
  if (sample.livePosts < MIN_LIVE_POSTS) return null;
  if (sample.livePosts >= CONFIDENCE_POSTS.high) return "high";
  if (sample.livePosts >= CONFIDENCE_POSTS.medium) return "medium";
  return "low";
}

const perUnit = (cents: number, units: number | null) => (units && units > 0 ? Math.round(cents / units) : null);

export function estimate(creators: EstimatorCreator[], sample: ObservedSample): Estimate {
  const { clickRate, leadRate } = ratesFrom(sample);
  const withReach = creators.filter((c) => c.medianViews > 0);
  const views = withReach.reduce((sum, c) => sum + c.medianViews, 0);
  const totalSpendCents = creators.reduce((sum, c) => sum + c.priceCents, 0);
  const estClicks = clickRate === null ? null : Math.round(views * clickRate);
  const estLeads = estClicks === null || leadRate === null ? null : Math.round(estClicks * leadRate);
  return {
    creators: creators.length,
    creatorsWithReach: withReach.length,
    totalSpendCents,
    clickRate,
    leadRate,
    estClicks,
    estLeads,
    estCpcCents: perUnit(totalSpendCents, estClicks),
    estCplCents: perUnit(totalSpendCents, estLeads),
    sample,
    confidence: confidenceFor(sample),
  };
}
