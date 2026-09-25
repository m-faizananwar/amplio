// Brand › Creators: marketplace, profile modal, booking and Nao matching.

export const PAGE_SIZE = 24;
export const MAX_PAGES = 50;
export const SEARCH_MAX_LENGTH = 80;

// The 24 industries creators pick from in onboarding; matching filters on the same list.
export const INDUSTRIES = [
  "B2B", "B2C", "AI", "SaaS", "Sales", "Marketing", "SEO", "Outreach", "CRM", "Creative", "Productivity",
  "Fintech", "HealthTech", "EdTech", "Cybersecurity", "Growth / GTM", "HR", "E-commerce", "Developer Tools",
  "Data / Analytics", "Customer Support", "Design", "Real Estate / PropTech", "LegalTech",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const SORT_KEYS = ["best", "price", "followers", "engagement"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "best", label: "Best match" },
  { value: "price", label: "Price: low to high" },
  { value: "followers", label: "Most followers" },
  { value: "engagement", label: "Best engagement" },
];

export const CREATOR_TABS = ["all", "shortlist"] as const;
export type CreatorTab = (typeof CREATOR_TABS)[number];

// "Make an offer" dialog.
export const DISCOUNT_PRESETS = [10, 20, 30] as const;
export const DEFAULT_DISCOUNT_PRESET = 20;
export const DEFAULT_POST_BY_DAYS = 14;
export const ACCEPT_WINDOW_HOURS = 48;
export const MIN_OFFER_CENTS = 2000; // marketplace floor: "from €20 per published post"
export const PLATFORM_MAX_POST_CENTS = 150_000; // "the platform limit of €1,500"
export const OFFER_NOTE_MAX_LENGTH = 500;

// Funded bookings: the wallet must cover the fee; the smallest top-up is €500.
export const MIN_TOPUP_CENTS = 50_000;
export const TOPUP_STEP_CENTS = 50_000;

// "Audience snapshot — Estimated from N recent public engagers": the sample
// size is a share of the creator's typical reach, bounded so tiny and huge
// accounts still read as a plausible sample.
export const ENGAGER_SAMPLE_RATE = 0.0026;
export const ENGAGER_SAMPLE_MIN = 25;
export const ENGAGER_SAMPLE_MAX = 120;

// Nao · Creator intelligence.
export const MATCHING_DEFAULT_COUNT = 4;
export const MATCHING_MAX_COUNT = 10;
export const MATCHING_PROMPT_MAX_LENGTH = 600;
export const MATCHING_MODEL = "claude-sonnet-5";
export const MATCHING_MAX_TOKENS = 1024;
export const MATCHING_TIMEOUT_MS = 20_000;

export const BILLING_PATH = "/brand/billing";
export const CREATORS_PATH = "/brand/creators";
export const MATCHING_PATH = "/brand/creators/matching";

// "Filters" pill: activity window on the creator's latest public post.
export const ACTIVITY_WINDOWS = ["any", "30", "60", "90"] as const;
export type ActivityWindow = (typeof ACTIVITY_WINDOWS)[number];
export const ACTIVITY_LABELS: Record<ActivityWindow, string> = { any: "Any time", "30": "Last 30 days", "60": "Last 60 days", "90": "Last 90 days" };
// "Top ranked creators — The 40 strongest profiles according to your sector and performance signals."
export const TOP_RANKED = 40;
export const TOP_RANKED_FEEDBACK_MAX = 20;
