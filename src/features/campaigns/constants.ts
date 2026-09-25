import type { CollaborationStatus } from "@/lib/collaboration-status";

import { BRAND } from "@/config/brand";
// The 24 industries creators pick from in onboarding; campaigns target the same list.
// Copied from scripts/seed/taxonomy.ts on purpose: features never import seeds.
export const INDUSTRIES = [
  "B2B", "B2C", "AI", "SaaS", "Sales", "Marketing", "SEO", "Outreach", "CRM", "Creative", "Productivity",
  "Fintech", "HealthTech", "EdTech", "Cybersecurity", "Growth / GTM", "HR", "E-commerce", "Developer Tools",
  "Data / Analytics", "Customer Support", "Design", "Real Estate / PropTech", "LegalTech",
] as const;

// Settings › Audience regions, in the product's order.
export const GEOGRAPHIES = ["Europe", "North America", "Latin America", "Asia", "Africa", "Oceania", "Middle East", "Worldwide"] as const;





// "Next action" column, from the brand's point of view.
export const COLLAB_NEXT_ACTION: Record<CollaborationStatus, string> = {
  invited: "Waiting for the creator to accept",
  applied: "Review the application",
  accepted: "Creator is writing the draft",
  declined: "No further action",
  draft_submitted: "Review the LinkedIn post",
  changes_requested: "Creator is revising the draft",
  approved: "Creator schedules the post",
  scheduled: "Post goes live on the scheduled date",
  live: `Payment scheduled · Handled by ${BRAND.name}`,
  paid: "Completed",
};


export const ANALYTICS_DAYS = 12;
export const BEST_FIT_LIMIT = 12;
export const DEFAULT_SELECTED_CREATORS = 4;
export const DEFAULT_POST_DEADLINE_DAYS = 14;
export const DAY_MS = 86_400_000;
export const DEFAULT_FEE_CENTS = 30_000;
export const MAX_FEE_CENTS = 150_000;

export const LAUNCH_STEPS = [
  { key: "basics", label: "Basics" },
  { key: "brief", label: "Brief" },
  { key: "creators", label: "Pick creators" },
  { key: "review", label: "Review & launch" },
] as const;
export type LaunchStepKey = (typeof LAUNCH_STEPS)[number]["key"];

// AI brief generation (features/campaigns/server/brief-ai.ts).
export const BRIEF_AI_MAX_TOKENS = 4_000;
export const BRIEF_AI_TIMEOUT_MS = 45_000;
export const BRIEF_PROMPT_MAX_CHARS = 1_000;
export const BRIEF_TEXT_MAX_CHARS = 4_000;
export const BRIEF_LIST_MAX_ITEMS = 12;
export const BRIEF_ANGLES_MAX = 6;
export const CAMPAIGN_NAME_MAX_CHARS = 120;
export const CAMPAIGN_DESCRIPTION_MAX_CHARS = 400;
export const LINK_URL_MAX_CHARS = 2_000;

