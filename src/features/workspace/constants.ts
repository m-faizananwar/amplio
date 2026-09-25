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


export const CREATOR_TOUR = [
  { step: 1, title: "Your Marketplace card", body: "This is your private preview and editor. Brands discover your positioning, audience and collaboration offer here.", href: "/creator/card", cta: "Open my card" },
  { step: 2, title: "Opportunities", body: "Open brand campaigns ranked by audience fit. Apply, the brand accepts, and the booking is created on your terms.", href: "/creator/opportunities", cta: "Browse opportunities" },
  { step: 3, title: "Collaborations", body: "Every step tells you where you stand, what to do, and what happens if you do nothing.", href: "/creator/collaborations", cta: "See collaborations" },
  { step: 4, title: "Analytics", body: "Public LinkedIn performance plus the clicks on every tracked link you publish.", href: "/creator/analytics", cta: "Open analytics" },
  { step: 5, title: "Earnings", body: "Net earnings per collaboration, what is awaiting release, and withdrawals.", href: "/creator/earnings", cta: "See earnings" },
] as const;
