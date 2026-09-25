import { z } from "zod";
import type { Estimate } from "@/lib/estimator";
import {
  BRIEF_ANGLES_MAX, BRIEF_LIST_MAX_ITEMS, BRIEF_PROMPT_MAX_CHARS, BRIEF_TEXT_MAX_CHARS, CAMPAIGN_DESCRIPTION_MAX_CHARS,
  CAMPAIGN_NAME_MAX_CHARS, LINK_URL_MAX_CHARS, MAX_FEE_CENTS,
} from "./constants";

// ---- the brief (editor fields, in the product's order) --------------------------

const line = z.string().trim().max(BRIEF_TEXT_MAX_CHARS);
const lineList = z.array(line).max(BRIEF_LIST_MAX_ITEMS).transform((items) => items.filter((item) => item.length > 0));

export const briefAngleSchema = z.object({
  angle: z.string().trim().min(1, "Give the angle a name").max(CAMPAIGN_NAME_MAX_CHARS),
  hook: line,
  direction: line,
  example: line,
});
export type BriefAngle = z.infer<typeof briefAngleSchema>;

export const briefSchema = z.object({
  whatToTell: z.string().trim().min(1, "Tell creators what to say").max(BRIEF_TEXT_MAX_CHARS),
  targetIndustries: z.array(z.string()).max(BRIEF_LIST_MAX_ITEMS),
  targetGeos: z.array(z.string()).max(BRIEF_LIST_MAX_ITEMS),
  tone: line,
  do: lineList,
  avoid: lineList,
  links: lineList,
  angles: z.array(briefAngleSchema).max(BRIEF_ANGLES_MAX),
});
export type Brief = z.infer<typeof briefSchema>;
// What the editor form holds before zod's transforms run (empty lines allowed).
export type BriefFormValues = z.input<typeof briefSchema>;

// What the AI (or the template) produces for a new campaign.
export const campaignDraftSchema = z.object({
  name: z.string().trim().min(1).max(CAMPAIGN_NAME_MAX_CHARS),
  description: z.string().trim().max(CAMPAIGN_DESCRIPTION_MAX_CHARS),
  brief: briefSchema,
});
export type CampaignDraft = z.infer<typeof campaignDraftSchema>;

// ---- action inputs ------------------------------------------------------------------

export const createFromAiSchema = z.object({
  prompt: z.string().trim().min(1, "Describe the campaign you want").max(BRIEF_PROMPT_MAX_CHARS),
});
export type CreateFromAiInput = z.infer<typeof createFromAiSchema>;


export const basicsSchema = z.object({
  campaignId: z.string().uuid(),
  name: z.string().trim().min(1, "Name the campaign").max(CAMPAIGN_NAME_MAX_CHARS),
  description: z.string().trim().max(CAMPAIGN_DESCRIPTION_MAX_CHARS),
  // ISO date (yyyy-mm-dd) from a date input; empty = no deadline yet.
  postDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date").or(z.literal("")),
  defaultFeeCents: z.number().int().min(0).max(MAX_FEE_CENTS, "The platform limit is €1,500 per post"),
});
export type BasicsInput = z.infer<typeof basicsSchema>;

export const saveBriefSchema = z.object({ campaignId: z.string().uuid(), brief: briefSchema });
export type SaveBriefInput = z.infer<typeof saveBriefSchema>;

export const launchSchema = z.object({ campaignId: z.string().uuid(), creatorIds: z.array(z.string().uuid()).max(50) });
export type LaunchInput = z.infer<typeof launchSchema>;

export const inviteSchema = z.object({ campaignId: z.string().uuid(), creatorId: z.string().uuid() });
export type InviteInput = z.infer<typeof inviteSchema>;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

// ---- DTOs (plain data crossing the server → view boundary) ------------------------

export type CampaignStatus = "draft" | "active" | "completed";
export type CampaignSource = "manual" | "ai" | "link" | "team";

export type CampaignDto = {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  source: CampaignSource;
  sourcePrompt: string | null;
  sourceUrl: string | null;
  openToApplications: boolean;
  postDeadline: string | null; // ISO
  defaultFeeCents: number;
  brief: Brief;
  createdAt: string; // ISO
};

export type CampaignCardDto = CampaignDto & { creators: number; published: number; committedCents: number };

export type CampaignSummaryDto = Pick<CampaignDto, "id" | "name" | "status">;

export type CollaborationRowDto = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  campaignId: string;
  campaignName: string;
  status: import("@/lib/collaboration-status").CollaborationStatus;
  origin: "invitation" | "application";
  feeCents: number;
  dueDate: string | null;
  updatedAt: string;
};

export type CreatorPickDto = {
  id: string;
  name: string;
  avatarUrl: string;
  headline: string;
  country: string;
  industries: string[];
  followers: number;
  medianViews: number;
  priceCents: number;
  fit: number;
  reason: string;
  /** The four signals, so a view can word the reason in the reader's language. */
  signals: import("@/lib/fit-score").FitSignal[];
  alreadyInvited: boolean;
};

export type EstimateDto = Estimate;

export type BrandProfile = {
  id: string;
  company: string;
  website: string | null;
  valueProp: string | null;
  icps: Array<{ title: string; description: string }>;
  targetIndustries: string[];
  targetRegions: string[];
  walletCents: number;
};

export type CampaignShellDto = {
  campaign: CampaignDto;
  brand: BrandProfile;
  summaries: CampaignSummaryDto[];
  // Active campaigns: the estimator over the creators on the campaign vs real clicks.
  projection: { estimate: EstimateDto; actualClicks: number } | null;
};

export type LaunchStepData =
  | { step: "basics" }
  | { step: "brief" }
  | { step: "creators"; creators: CreatorPickDto[] }
  | { step: "review"; creators: CreatorPickDto[]; estimate: EstimateDto };

export type LaunchPlanDto = { explored: boolean; briefed: boolean; invited: boolean; stepsLeft: number };

export type AnalyticsDto = {
  estReach: number;
  publishedPosts: number;
  /** Live posts whose creator's median views aren't known: they add nothing to estReach. */
  reachUnknown: number;
  qualifiedClicks: number;
  committedCents: number;
  bookings: number;
  daily: Array<{ day: string; clicks: number }>;
  byCreator: Array<{ creatorId: string; creatorName: string; avatarUrl: string; clicks: number }>;
  posts: Array<{ collaborationId: string; creatorName: string; postUrl: string; publishedAt: string; clicks: number }>;
};

export type LaunchResultDto = {
  campaignId: string;
  invited: string[];
  unfunded: Array<{ creatorId: string; name: string; shortfallCents: number }>;
  /** Why an invitation wasn't sent: already on the campaign, or the insert failed. */
  skipped: Array<{ creatorId: string; name: string; reason: "duplicate" | "failed" }>;
};
