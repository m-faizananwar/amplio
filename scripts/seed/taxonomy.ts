// A common 24-industry list, as creator onboarding flows use it.
export const INDUSTRIES = [
  "B2B", "B2C", "AI", "SaaS", "Sales", "Marketing", "SEO", "Outreach", "CRM", "Creative", "Productivity",
  "Fintech", "HealthTech", "EdTech", "Cybersecurity", "Growth / GTM", "HR", "E-commerce", "Developer Tools",
  "Data / Analytics", "Customer Support", "Design", "Real Estate / PropTech", "LegalTech",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const COUNTRY_WEIGHTS = { FR: 30, UK: 20, US: 20, DE: 15, PK: 4, IN: 4, NL: 4, ES: 3 } as const;

export const JOB_TITLES = ["Founders", "Marketing", "Sales", "Engineering", "Product", "HR", "Finance", "Operations", "Other"] as const;
export const SENIORITY = ["Founder / C-level", "VP / Director", "Manager", "Individual contributor", "Other"] as const;

// Which buyer titles an industry's audience skews toward. Base weights; the
// seed jitters them per creator.
export const INDUSTRY_AUDIENCE: Record<Industry, Partial<Record<(typeof JOB_TITLES)[number], number>>> = {
  "B2B": { Founders: 30, Sales: 25, Marketing: 25, Operations: 10 },
  "B2C": { Marketing: 45, Founders: 20, Product: 15 },
  "AI": { Engineering: 30, Founders: 30, Product: 20 },
  "SaaS": { Founders: 35, Product: 20, Sales: 15, Marketing: 15 },
  "Sales": { Sales: 50, Founders: 25, Operations: 10 },
  "Marketing": { Marketing: 55, Founders: 20, Sales: 10 },
  "SEO": { Marketing: 60, Founders: 20 },
  "Outreach": { Sales: 55, Founders: 20, Marketing: 15 },
  "CRM": { Sales: 40, Operations: 25, Founders: 15 },
  "Creative": { Marketing: 45, Founders: 20, Product: 10 },
  "Productivity": { Founders: 30, Operations: 25, Product: 20 },
  "Fintech": { Finance: 40, Founders: 30, Product: 10 },
  "HealthTech": { Founders: 30, Operations: 25, Product: 20 },
  "EdTech": { Founders: 30, HR: 20, Marketing: 20 },
  "Cybersecurity": { Engineering: 40, Founders: 20, Operations: 20 },
  "Growth / GTM": { Marketing: 35, Sales: 30, Founders: 25 },
  "HR": { HR: 55, Founders: 20, Operations: 15 },
  "E-commerce": { Marketing: 40, Founders: 30, Operations: 15 },
  "Developer Tools": { Engineering: 55, Founders: 25, Product: 10 },
  "Data / Analytics": { Engineering: 30, Product: 25, Marketing: 20, Finance: 10 },
  "Customer Support": { Operations: 40, Product: 20, Founders: 20 },
  "Design": { Product: 40, Marketing: 25, Founders: 20 },
  "Real Estate / PropTech": { Founders: 35, Finance: 25, Operations: 20 },
  "LegalTech": { Founders: 35, Operations: 25, Finance: 15 },
};

// A Q2 2026 creator benchmark: smaller creators get higher CTR. `reach` is
// median views as a multiple of followers (LinkedIn reach runs 1.5-4x the
// follower count, higher for smaller accounts).
export const TIERS = [
  { max: 3_000, ctr: 0.138, engagement: 0.055, reach: 3.6 },
  { max: 7_000, ctr: 0.121, engagement: 0.042, reach: 3.0 },
  { max: 10_000, ctr: 0.104, engagement: 0.034, reach: 2.5 },
  { max: 100_000, ctr: 0.087, engagement: 0.024, reach: 2.0 },
  { max: Infinity, ctr: 0.087, engagement: 0.018, reach: 1.6 },
] as const;
// Observed market CPMs sit between 11 and 34 EUR.
export const CPM_EUR = { median: 18, sigma: 0.3, min: 11, max: 34 } as const;

export function tierFor(followers: number) {
  return TIERS.find((t) => followers <= t.max) ?? TIERS[TIERS.length - 1];
}

export const HEADLINE_TEMPLATES = [
  "I help {a} teams turn {b} into pipeline",
  "{a} operator · writing about {b} every week",
  "Founder · {a} · sharing what works in {b}",
  "Ex-{c}, now building in {a}. Notes on {b}.",
  "{a} advisor for early-stage SaaS · {b} without the fluff",
  "Head of {b} → independent · {a} playbooks",
];
export const FORMER_EMPLOYERS = ["Attio", "Notion", "HubSpot", "Stripe", "Pipedrive", "Lemlist", "Aircall", "Qonto", "Malt", "Doctolib"];

export const POST_OPENERS = [
  "Unpopular opinion after 3 years in {a}:",
  "I reviewed 40 {a} onboarding flows last month. Same mistake in 31 of them.",
  "Nobody tells you this about {b} when you start.",
  "We cut our {b} cost by 38% with one change. Here's the whole thing:",
  "The best {a} teams I know do one thing differently.",
  "Stop optimising {b}. Start measuring it.",
];
export const POST_BODIES = [
  "It's not the tool. It's that the first message has no reason to exist. Fix the reason, the reply rate follows.",
  "Three things worked: fewer fields, one owner per account, and a weekly 20-minute review that nobody skips.",
  "The pattern: teams buy software to solve a process problem, then keep the process. The software gets blamed.",
  "If you can't say who the post is for in one line, the algorithm can't either. Audience before reach, always.",
  "I keep a doc of every experiment with a one-line verdict. 80% of our wins came from re-reading it.",
];
