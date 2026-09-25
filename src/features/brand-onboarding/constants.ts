import { BRAND } from "@/config/brand";
// Brand onboarding: the 3 steps after "register as brand" (product map,
// "Brand onboarding after email + 6-digit code").

export const ONBOARDING_ROUTES = {
  index: "/onboarding/brand",
  website: "/onboarding/brand/website",
  profile: "/onboarding/brand/profile",
} as const;


// server/site-reader.ts
export const SITE_FETCH_TIMEOUT_MS = 10_000;
export const SITE_FETCH_MAX_BYTES = 1_500_000;
export const SITE_FETCH_MAX_REDIRECTS = 5;
export const SITE_FETCH_USER_AGENT = "naano-rebuild/1.0 (+https://github.com/m-faizananwar/naano-rebuild; brand onboarding site reader)";
export const SITE_TITLE_MAX_CHARS = 200;
export const SITE_DESCRIPTION_MAX_CHARS = 600;
export const SITE_HEADING_MAX_CHARS = 160;
export const SITE_HEADINGS_MAX = 12;
export const WEBSITE_URL_MAX_CHARS = 2_000;

// server/profile-ai.ts
export const PROFILE_AI_MAX_TOKENS = 2_000;
export const PROFILE_AI_TIMEOUT_MS = 30_000;
export const ICP_COUNT = 3;
export const VALUE_PROP_MAX_CHARS = 2_000;
export const ICP_TITLE_MAX_CHARS = 120;
export const ICP_DESCRIPTION_MAX_CHARS = 1_200;
export const COMPANY_MAX_CHARS = 80;

// The auto-created campaign (product map: "Onboarding auto-creates one Active
// campaign named '{Company} creator brief'").
export const STARTER_CAMPAIGN_SUFFIX = "creator brief";
export const STARTER_POST_DEADLINE_DAYS = 14;
export const STARTER_FEE_CENTS = 30_000;
export const DAY_MS = 86_400_000;
export const DEFAULT_TARGET_INDUSTRIES = ["B2B", "SaaS"] as const;
export const DEFAULT_TARGET_REGIONS = ["Europe"] as const;
export const INFERRED_INDUSTRIES_MAX = 3;
export const INFERRED_INDUSTRIES_MIN = 2;

// Keyword → industry (labels from naano's 24 industries, campaigns/constants).
// Hits are counted over the fetched title, description and headings.
export const INDUSTRY_KEYWORDS: ReadonlyArray<{ industry: string; keywords: readonly string[] }> = [
  { industry: "AI", keywords: ["ai", "artificial intelligence", "llm", "machine learning", "agent", "rag", "gpt"] },
  { industry: "SaaS", keywords: ["saas", "software", "platform", "cloud", "app", "subscription"] },
  { industry: "Developer Tools", keywords: ["developer", "api", "sdk", "deploy", "open source", "framework", "code"] },
  { industry: "Marketing", keywords: ["marketing", "brand", "campaign", "content", "creator"] },
  { industry: "Sales", keywords: ["sales", "pipeline", "revenue", "deal", "quota"] },
  { industry: "Fintech", keywords: ["fintech", "payment", "banking", "finance", "invoice"] },
  { industry: "HealthTech", keywords: ["health", "clinic", "patient", "medical"] },
  { industry: "Cybersecurity", keywords: ["security", "cyber", "compliance", "threat"] },
  { industry: "Data / Analytics", keywords: ["analytics", "data", "dashboard", "insight"] },
  { industry: "E-commerce", keywords: ["ecommerce", "e-commerce", "shop", "store", "checkout"] },
  { industry: "HR", keywords: ["hiring", "recruit", "talent", "employee", "hr "] },
  { industry: "Design", keywords: ["design", "ux", "ui", "studio"] },
  { industry: "Productivity", keywords: ["productivity", "workflow", "automation", "workspace"] },
  { industry: "Growth / GTM", keywords: ["growth", "go-to-market", "gtm", "acquisition"] },
  { industry: "SEO", keywords: ["seo", "search engine", "ranking"] },
  { industry: "CRM", keywords: ["crm", "customer relationship"] },
  { industry: "EdTech", keywords: ["learning", "education", "course", "student"] },
  { industry: "LegalTech", keywords: ["legal", "contract", "law"] },
  { industry: "Customer Support", keywords: ["support", "helpdesk", "ticket"] },
  { industry: "Real Estate / PropTech", keywords: ["real estate", "property", "proptech"] },
];

// The coach mark on the marketplace (goes when that page stops mounting it).
export const COPY = {
  coachMark: {
    title: `${BRAND.copilot} is using your campaign brief`,
    body: `Your starter brief is attached. Tell ${BRAND.copilot} what matters most, open profiles, and save the creators you want to invite.`,
    gotIt: "Got it",
    backToCampaign: "Back to campaign",
  },
} as const;

export const WELCOME_PARAMS = { campaign: "welcomeCampaign", step: "welcomeStep", stepValue: "creators" } as const;
