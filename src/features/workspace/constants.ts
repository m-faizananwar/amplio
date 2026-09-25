import { BRAND } from "@/config/brand";
export const NEW_CREATORS_LIMIT = 5;
export const NEW_CREATORS_POOL = 60;
export const LOW_WALLET_CENTS = 100_000;
export const NOTIFICATION_LIMIT = 6;

// The 24 industries creators pick from in onboarding; settings edit the same list.
export const INDUSTRIES = [
  "B2B", "B2C", "AI", "SaaS", "Sales", "Marketing", "SEO", "Outreach", "CRM", "Creative", "Productivity",
  "Fintech", "HealthTech", "EdTech", "Cybersecurity", "Growth / GTM", "HR", "E-commerce", "Developer Tools",
  "Data / Analytics", "Customer Support", "Design", "Real Estate / PropTech", "LegalTech",
] as const;
export const REGIONS = ["Europe", "North America", "Latin America", "Asia", "Africa", "Oceania", "Middle East", "Worldwide"] as const;
