import { z } from "zod";
import type { CollaborationEvent, CollaborationStatus } from "@/lib/collaboration-status";
import type { BriefDoc } from "@/lib/brief-markdown";
import type { PartyKind } from "@/components/PartyAvatar";
import {
  DRAFT_MAX_CHARS,
  DRAFT_MIN_CHARS,
  MESSAGE_MAX_CHARS,
  REVIEW_NOTE_MAX_CHARS,
  REVIEW_NOTE_MIN_CHARS,
} from "./ui-constants";

// Every server action returns this shape; nothing throws to the client.
// `code` lets a view react to a known failure (e.g. link to Billing).
export type ActionErrorCode = "insufficient_funds" | "illegal_transition" | "duplicate";
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string; code?: ActionErrorCode };

// ---- mutation inputs ----------------------------------------------------------

// Double-submit CSRF: the token from the session row travels with every write.
const withCsrf = { csrfToken: z.string().min(1) };
const collaborationId = z.string().uuid("Unknown collaboration");

export const applySchema = z.object({ ...withCsrf, campaignId: z.string().uuid("Unknown campaign") });
export type ApplyInput = z.infer<typeof applySchema>;

export const decisionSchema = z.object({ ...withCsrf, collaborationId, decision: z.enum(["accept", "decline"]) });
export type DecisionInput = z.infer<typeof decisionSchema>;

export const draftFormSchema = z.object({
  draftText: z
    .string()
    .trim()
    .min(DRAFT_MIN_CHARS, `Write at least ${DRAFT_MIN_CHARS} characters — the brand reviews the full post.`)
    .max(DRAFT_MAX_CHARS, `Keep it under ${DRAFT_MAX_CHARS} characters (LinkedIn's limit).`),
});
export type DraftFormInput = z.infer<typeof draftFormSchema>;
export const submitDraftSchema = draftFormSchema.extend({ ...withCsrf, collaborationId });
export type SubmitDraftInput = z.infer<typeof submitDraftSchema>;

const futureDate = z
  .string()
  .min(1, "Pick a date")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date")
  .refine((v) => new Date(v).getTime() >= Date.now(), "The publish date must be in the future");
export const scheduleFormSchema = z.object({ scheduledAt: futureDate });
export type ScheduleFormInput = z.infer<typeof scheduleFormSchema>;
export const scheduleSchema = scheduleFormSchema.extend({ ...withCsrf, collaborationId });
export type ScheduleInput = z.infer<typeof scheduleSchema>;

const linkedinUrl = z
  .string()
  .trim()
  .url("Paste the full URL of the post")
  .refine((v) => {
    try {
      const host = new URL(v).hostname.toLowerCase();
      return host === "linkedin.com" || host.endsWith(".linkedin.com");
    } catch {
      return false;
    }
  }, "The post URL must be on linkedin.com");
export const publishFormSchema = z.object({ postUrl: linkedinUrl });
export type PublishFormInput = z.infer<typeof publishFormSchema>;
export const publishSchema = publishFormSchema.extend({ ...withCsrf, collaborationId });
export type PublishInput = z.infer<typeof publishSchema>;

export const reviewFormSchema = z
  .object({
    decision: z.enum(["approve", "request_changes"]),
    note: z.string().trim().max(REVIEW_NOTE_MAX_CHARS, `Keep the comment under ${REVIEW_NOTE_MAX_CHARS} characters`),
  })
  .refine((v) => v.decision === "approve" || v.note.length >= REVIEW_NOTE_MIN_CHARS, {
    path: ["note"],
    message: "Tell the creator what to change.",
  });
export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
export const reviewSchema = z.object({
  ...withCsrf,
  collaborationId,
  decision: z.enum(["approve", "request_changes"]),
  note: z.string().trim().max(REVIEW_NOTE_MAX_CHARS),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const paySchema = z.object({ ...withCsrf, collaborationId });
export type PayInput = z.infer<typeof paySchema>;

export const messageFormSchema = z.object({
  body: z.string().trim().min(1, "Write something first").max(MESSAGE_MAX_CHARS, `Keep it under ${MESSAGE_MAX_CHARS} characters`),
});
export type MessageFormInput = z.infer<typeof messageFormSchema>;
export const sendMessageSchema = messageFormSchema.extend({ ...withCsrf, collaborationId });
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ---- DTOs (what crosses the server → view boundary) ---------------------------

export type ViewerRole = "brand" | "creator";

export type CollaborationDto = {
  id: string;
  status: CollaborationStatus;
  origin: "invitation" | "application";
  campaignId: string;
  campaignName: string;
  brandId: string;
  brandCompany: string;
  brandInitial: string;
  /** The brand's uploaded logo, or null (then its trail mark is drawn). */
  brandLogoUrl: string | null;
  brandWebsite: string | null;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  feeCents: number;
  listPriceCents: number | null;
  discountPercent: number;
  approveBeforePublish: boolean;
  acceptBy: string | null;
  offerNote: string | null;
  dueDate: string | null;
  revisionRound: number;
  maxRevisionRounds: number;
  draftText: string | null;
  reviewNote: string | null;
  postUrl: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  trackingCode: string | null;
  trackingDestination: string | null;
  // null until the post is live; the clicks table is the only source.
  clicks: number | null;
  // What the viewer's role may do right now, straight from the state machine.
  allowedEvents: CollaborationEvent[];
};

export type CollaborationEventDto = {
  id: string;
  fromStatus: CollaborationStatus | null;
  toStatus: CollaborationStatus;
  event: string;
  actor: "brand" | "creator" | "system";
  note: string | null;
  createdAt: string;
};

export type BriefDto = BriefDoc & {
  campaignId: string;
  brandInitial: string;
  angleCount: number;
};

export type CollaborationDetailDto = {
  collaboration: CollaborationDto;
  events: CollaborationEventDto[];
  brief: BriefDto;
  // Absolute tracked URL (/r/{code}) once the tracking link exists.
  trackedUrl: string | null;
};

export type CampaignOption = { id: string; name: string };

export type OpportunityDto = {
  campaignId: string;
  campaignName: string;
  description: string;
  brandCompany: string;
  brandInitial: string;
  brandLogoUrl: string | null;
  brandWebsite: string | null;
  industries: string[];
  regions: string[];
  postDeadline: string | null;
  daysToDeadline: number | null;
  matchScore: number;
  matchReason: string;
  /** The four weighted signals behind matchScore, so the fit can be opened in place. */
  fitSignals: Array<{ key: "audience" | "category" | "engagement" | "consistency"; score: number; weight: number }>;
  listPriceCents: number;
  existingCollaborationId: string | null;
  existingStatus: CollaborationStatus | null;
  brief: BriefDto;
};

export type ThreadDto = {
  collaborationId: string;
  campaignId: string;
  campaignName: string;
  status: CollaborationStatus;
  counterpartName: string;
  counterpartKind: PartyKind;
  counterpartAvatarUrl: string | null;
  counterpartInitial: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

export type MessageDto = {
  id: string;
  body: string;
  senderName: string;
  senderKind: PartyKind;
  senderAvatarUrl: string | null;
  mine: boolean;
  createdAt: string;
};

export type ThreadDetailDto = {
  thread: ThreadDto;
  messages: MessageDto[];
};
