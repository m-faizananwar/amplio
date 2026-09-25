// The "starting price" we recommend to a creator in onboarding. Anchored on the one
// observation we have (2,070 followers, AI / SaaS / Productivity, ordinary
// engagement → €315) and shaped like the seed's formula: price follows reach
// sub-linearly, premium B2B verticals nudge it up, engagement far outside the
// band expected for the account's size nudges it either way.

export const PRICE_FLOOR_CENTS = 2000;
export const PRICE_CAP_CENTS = 150_000;

const ANCHOR = { followers: 2070, cents: 31_500, industryFactor: 1.0667 } as const;
const FOLLOWER_EXPONENT = 0.45;
const ROUND_TO_CENTS = 500;

// Verticals brands pay a premium for on LinkedIn. Everything else is 1.0.
const PREMIUM_INDUSTRIES = new Set([
  "AI", "SaaS", "Fintech", "Cybersecurity", "Developer Tools", "Data / Analytics", "HealthTech", "LegalTech",
]);
const PREMIUM_FACTOR = 1.1;
const STANDARD_FACTOR = 1;

// Engagement a healthy account of that size typically shows. Inside the band
// around it the price is unaffected; outside, it moves with the square root.
const EXPECTED_ENGAGEMENT = [
  { maxFollowers: 3_000, rate: 0.05 },
  { maxFollowers: 7_000, rate: 0.04 },
  { maxFollowers: 10_000, rate: 0.034 },
  { maxFollowers: 100_000, rate: 0.024 },
  { maxFollowers: Infinity, rate: 0.018 },
] as const;
const ENGAGEMENT_BAND = 0.3;
const ENGAGEMENT_FACTOR_MIN = 0.7;
const ENGAGEMENT_FACTOR_MAX = 1.4;

export function expectedEngagementRate(followers: number): number {
  const tier = EXPECTED_ENGAGEMENT.find((t) => followers <= t.maxFollowers) ?? EXPECTED_ENGAGEMENT[EXPECTED_ENGAGEMENT.length - 1];
  return tier.rate;
}

export function industryFactor(industries: readonly string[]): number {
  if (industries.length === 0) return STANDARD_FACTOR;
  const total = industries.reduce((sum, i) => sum + (PREMIUM_INDUSTRIES.has(i) ? PREMIUM_FACTOR : STANDARD_FACTOR), 0);
  return total / industries.length;
}

export function engagementFactor(followers: number, engagementRate: number): number {
  if (engagementRate <= 0) return STANDARD_FACTOR;
  const ratio = engagementRate / expectedEngagementRate(followers);
  if (Math.abs(ratio - 1) <= ENGAGEMENT_BAND) return STANDARD_FACTOR;
  return Math.min(ENGAGEMENT_FACTOR_MAX, Math.max(ENGAGEMENT_FACTOR_MIN, Math.sqrt(ratio)));
}

function clampPrice(cents: number) {
  return Math.min(PRICE_CAP_CENTS, Math.max(PRICE_FLOOR_CENTS, cents));
}

// Cents, rounded to €5, floored at €20 and capped at €1,500: the suggestion
// stops there, though a creator can list a higher price themselves.
export function recommendPrice(followers: number, industries: readonly string[], engagementRate = 0): number {
  if (!Number.isFinite(followers) || followers <= 0) return PRICE_FLOOR_CENTS;
  const reach = Math.pow(followers / ANCHOR.followers, FOLLOWER_EXPONENT);
  const base = (ANCHOR.cents / ANCHOR.industryFactor) * reach;
  const cents = base * industryFactor(industries) * engagementFactor(followers, engagementRate);
  return clampPrice(Math.round(cents / ROUND_TO_CENTS) * ROUND_TO_CENTS);
}
