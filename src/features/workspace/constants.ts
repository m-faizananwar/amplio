import { BRAND } from "@/config/brand";
export const NEW_CREATORS_LIMIT = 5;
export const NEW_CREATORS_POOL = 60;
export const LOW_WALLET_CENTS = 100_000;
export const NOTIFICATION_LIMIT = 6;
export const AFFILIATE_SHARE_PERCENT = 25;
export const AFFILIATE_MONTHS = 3;
// naano does not publish its take rate; 20% is the assumption the reward maths use.
export const PLATFORM_COMMISSION_PERCENT = 20;

// naano's 24 industries, verbatim from the creator onboarding (product map).
export const INDUSTRIES = [
  "B2B", "B2C", "AI", "SaaS", "Sales", "Marketing", "SEO", "Outreach", "CRM", "Creative", "Productivity",
  "Fintech", "HealthTech", "EdTech", "Cybersecurity", "Growth / GTM", "HR", "E-commerce", "Developer Tools",
  "Data / Analytics", "Customer Support", "Design", "Real Estate / PropTech", "LegalTech",
] as const;
export const REGIONS = ["Europe", "North America", "Latin America", "Asia", "Africa", "Oceania", "Middle East", "Worldwide"] as const;
