import type { AudienceMix, CreatorBundle } from "@/db/schema";
import { daysAgo, faker, jitter, lognormal, pickWeighted, toPercentMix } from "./random";
import { BRAND } from "@/config/brand";
import {
  COUNTRY_WEIGHTS, CPM_EUR, FORMER_EMPLOYERS, HEADLINE_TEMPLATES, INDUSTRIES, INDUSTRY_AUDIENCE, type Industry,
  JOB_TITLES, POST_BODIES, POST_OPENERS, SENIORITY, tierFor,
} from "./taxonomy";

export type CreatorFixture = {
  handle: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  industries: Industry[];
  headline: string;
  bio: string;
  followers: number;
  priceCents: number;
  bundles: CreatorBundle[];
  medianViews: number;
  engagementRate: number;
  postsPerMonth: number;
  audienceJobTitles: AudienceMix;
  audienceSeniority: AudienceMix;
  avatarUrl: string;
  posts: PostFixture[];
};
export type PostFixture = {
  url: string;
  body: string;
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  postedAt: Date;
};

export const CREATOR_COUNT = 300;
const PRICE_ANCHOR = { followers: 2070, cents: 31500 }; // an observed market recommendation
const PRICE_EXPONENT = 0.45;
const PRICE_FLOOR = 2000;
const PRICE_CAP = 150000;

export function avatarFor(handle: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(handle)}&backgroundColor=e8eefc,dbe4ff,eef2ff`;
}

// The usual recommendation follows reach; what a creator actually charges is
// that times a positioning factor — most sit near it, a tail prices low to
// win first bookings — floored at €20 and capped at the €1,500 platform limit.
export function recommendPriceCents(followers: number) {
  const base = PRICE_ANCHOR.cents * Math.pow(followers / PRICE_ANCHOR.followers, PRICE_EXPONENT);
  return Math.min(PRICE_CAP, Math.max(PRICE_FLOOR, Math.round(jitter(base, 0.15) / 500) * 500));
}

// What creators actually charge: their median views priced at a CPM drawn from
// The observed market 11-34 EUR band, rounded to 5 EUR, within the platform limits.
export function priceFromViewsCents(medianViews: number) {
  const cpm = lognormal(CPM_EUR.median * 100, CPM_EUR.sigma, CPM_EUR.min * 100, CPM_EUR.max * 100) / 100;
  const cents = Math.round(((medianViews * cpm) / 1000) * 100 / 500) * 500;
  return Math.min(PRICE_CAP, Math.max(PRICE_FLOOR, cents));
}

function fill(template: string, industries: Industry[]) {
  return template
    .replaceAll("{a}", industries[0])
    .replaceAll("{b}", (industries[1] ?? industries[0]).toLowerCase())
    .replaceAll("{c}", faker.helpers.arrayElement(FORMER_EMPLOYERS));
}

function audienceFor(industries: Industry[]): AudienceMix {
  const weights: Record<string, number> = Object.fromEntries(JOB_TITLES.map((t) => [t, 0]));
  for (const industry of industries) {
    for (const [title, weight] of Object.entries(INDUSTRY_AUDIENCE[industry])) {
      weights[title] += jitter(weight ?? 0, 0.4);
    }
  }
  weights.Other += 6;
  const top = Object.entries(weights).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return toPercentMix(Object.fromEntries(top));
}

function seniorityFor(): AudienceMix {
  const [founder, vp, manager, ic, other] = SENIORITY;
  return toPercentMix({
    [founder]: jitter(40, 0.5),
    [vp]: jitter(20, 0.5),
    [manager]: jitter(25, 0.5),
    [ic]: jitter(12, 0.5),
    [other]: 3,
  });
}

function postsFor(c: Pick<CreatorFixture, "handle" | "industries" | "medianViews" | "engagementRate">): PostFixture[] {
  const count = faker.number.int({ min: 2, max: 3 });
  return Array.from({ length: count }, (_, i) => {
    const impressions = Math.round(jitter(c.medianViews, 0.6));
    const reactions = Math.round(impressions * c.engagementRate * jitter(0.8, 0.3));
    return {
      url: `https://www.linkedin.com/posts/${c.handle}_${faker.string.alphanumeric(12).toLowerCase()}`,
      body: `${fill(faker.helpers.arrayElement(POST_OPENERS), c.industries)}\n\n${faker.helpers.arrayElement(POST_BODIES)}`,
      impressions,
      reactions,
      comments: Math.round(reactions * jitter(0.12, 0.5)),
      reposts: Math.round(reactions * jitter(0.05, 0.6)),
      postedAt: daysAgo(faker.number.int({ min: 2 + i * 12, max: 12 + i * 12 })),
    };
  });
}

export function buildCreator(overrides: Partial<CreatorFixture> = {}): CreatorFixture {
  const firstName = overrides.firstName ?? faker.person.firstName();
  const lastName = overrides.lastName ?? faker.person.lastName();
  const handle =
    overrides.handle ?? `${firstName}-${lastName}-${faker.string.alphanumeric(3)}`.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const industries =
    overrides.industries ?? faker.helpers.arrayElements(INDUSTRIES, faker.number.int({ min: 1, max: 3 }));
  const followers = overrides.followers ?? lognormal(6000, 1.25, 1000, 500000);
  const tier = tierFor(followers);
  const medianViews = overrides.medianViews ?? Math.round(followers * jitter(tier.reach, 0.35));
  const engagementRate = overrides.engagementRate ?? Number(jitter(tier.engagement, 0.35).toFixed(4));
  const priceCents = overrides.priceCents ?? priceFromViewsCents(medianViews);
  const bundles: CreatorBundle[] =
    overrides.bundles ??
    (faker.datatype.boolean({ probability: 0.4 })
      ? [{ posts: 5, totalCents: Math.round((priceCents * 5 * jitter(0.83, 0.05)) / 500) * 500 }]
      : []);
  const base = {
    handle,
    firstName,
    lastName,
    email: overrides.email ?? `${handle}@example.com`,
    country: overrides.country ?? pickWeighted(COUNTRY_WEIGHTS),
    industries,
    headline: overrides.headline ?? fill(faker.helpers.arrayElement(HEADLINE_TEMPLATES), industries),
    bio: overrides.bio ?? `${fill(faker.helpers.arrayElement(HEADLINE_TEMPLATES), industries)}. ${faker.lorem.sentences(2)}`,
    followers,
    priceCents,
    bundles,
    medianViews,
    engagementRate,
    postsPerMonth: Number(jitter(10, 0.6).toFixed(1)),
    audienceJobTitles: overrides.audienceJobTitles ?? audienceFor(industries),
    audienceSeniority: overrides.audienceSeniority ?? seniorityFor(),
    avatarUrl: avatarFor(handle),
  };
  return { ...base, posts: overrides.posts ?? postsFor(base) };
}

// The demo creator mirrors the account observed during recon (2,070 followers,
// AI / SaaS / Productivity, Pakistan, €315 recommended, 5-post bundle at €1,340).
export function buildDemoCreator(): CreatorFixture {
  return buildCreator({
    handle: "faizan-anwar",
    firstName: "Faizan",
    lastName: "Anwar",
    email: `creator@${BRAND.demoDomain}`,
    country: "PK",
    industries: ["AI", "SaaS", "Productivity"],
    headline: "Building AI workflows for small SaaS teams · notes on productivity that actually ships",
    followers: 2070,
    medianViews: 8280,
    priceCents: 31500,
    bundles: [{ posts: 5, totalCents: 134000 }],
  });
}

export function buildCreators(): CreatorFixture[] {
  const demo = buildDemoCreator();
  const rest = Array.from({ length: CREATOR_COUNT - 1 }, () => buildCreator());
  return [demo, ...rest];
}
