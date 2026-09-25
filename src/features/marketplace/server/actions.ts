"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { campaigns, creators, shortlist, naoFeedback } from "@/db/schema";
import { getViewer, type Viewer } from "@/features/auth/server/session";
import { createCollaboration, DuplicateCollaborationError } from "@/features/collaborations/server/create";
import { InsufficientFundsError } from "@/features/collaborations/server/side-effects";
import { CREATORS_PATH, INDUSTRIES, MATCHING_DEFAULT_COUNT, MATCHING_MAX_COUNT, MATCHING_PATH, MIN_TOPUP_CENTS, TOPUP_STEP_CENTS } from "../constants";
import {
  type ActionError, type ActionResult, type BookingResultDto, bookCreatorSchema, type MatchingResultDto, runMatchingSchema, naoFeedbackSchema,
  sendOfferSchema, toggleShortlistSchema,
} from "../schemas";
import { writeRationale } from "./matching-rationale";
import { getMarketplaceContext, rankCreators } from "./queries";

import { BRAND } from "@/config/brand";
const UNAUTHORIZED: ActionError = { ok: false, error: "Sign in as a brand to do this.", code: "unauthorized" };

async function brandViewer(): Promise<{ viewer: Viewer; brandId: string } | null> {
  const viewer = await getViewer();
  if (!viewer?.brand) return null;
  return { viewer, brandId: viewer.brand.id };
}

async function ownsCampaign(brandId: string, campaignId: string) {
  const [row] = await getDb()
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, brandId)));
  return Boolean(row);
}

// "Your selection" bundle row: the creator's first (only) bundle.
async function firstBundleOf(creatorId: string) {
  const [row] = await getDb().select({ bundles: creators.bundles }).from(creators).where(eq(creators.id, creatorId));
  return row?.bundles[0] ?? null;
}

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Invalid input";
}

// The smallest top-up that covers the shortfall, in €500 steps (Billing's minimum).
function topupFor(shortfallCents: number) {
  return Math.max(MIN_TOPUP_CENTS, Math.ceil(shortfallCents / TOPUP_STEP_CENTS) * TOPUP_STEP_CENTS);
}

function bookingError(error: unknown, context: Record<string, unknown>): ActionError {
  if (error instanceof InsufficientFundsError) {
    return { ok: false, error: "Your wallet does not cover this booking yet.", code: "insufficient_funds", shortfallCents: topupFor(error.shortfallCents) };
  }
  if (error instanceof DuplicateCollaborationError) {
    return { ok: false, error: "This creator is already part of this campaign.", code: "duplicate" };
  }
  console.error("[marketplace] booking failed", { ...context, error });
  return { ok: false, error: "The invitation could not be sent. Please try again.", code: "unknown" };
}

function revalidate() {
  revalidatePath(CREATORS_PATH);
  revalidatePath(MATCHING_PATH);
}

// ---- shortlist ----------------------------------------------------------------------

export async function toggleShortlist(input: unknown): Promise<ActionResult<{ shortlisted: boolean }>> {
  const auth = await brandViewer();
  if (!auth) return UNAUTHORIZED;
  const parsed = toggleShortlistSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error), code: "invalid" };
  const { creatorId, shortlisted } = parsed.data;
  try {
    const db = getDb();
    if (shortlisted) {
      await db.insert(shortlist).values({ brandId: auth.brandId, creatorId }).onConflictDoNothing();
    } else {
      await db.delete(shortlist).where(and(eq(shortlist.brandId, auth.brandId), eq(shortlist.creatorId, creatorId)));
    }
    updateTags(tagsForMutation("shortlist", { brandId: auth.brandId }));
    revalidate();
    return { ok: true, data: { shortlisted } };
  } catch (error) {
    console.error("[marketplace] shortlist toggle failed", { brandId: auth.brandId, creatorId, error });
    return { ok: false, error: "Could not update your shortlist. Please try again.", code: "unknown" };
  }
}

// ---- booking ("Your selection" → Book) -----------------------------------------------

export async function bookCreator(input: unknown): Promise<ActionResult<BookingResultDto>> {
  const auth = await brandViewer();
  if (!auth) return UNAUTHORIZED;
  const parsed = bookCreatorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error), code: "invalid" };
  const { campaignId, creatorId, option } = parsed.data;
  if (!(await ownsCampaign(auth.brandId, campaignId))) return UNAUTHORIZED;

  try {
    const bundle = option === "bundle" ? await firstBundleOf(creatorId) : null;
    const collab = await createCollaboration({
      campaignId,
      creatorId,
      origin: "invitation",
      feeCents: bundle?.totalCents,
      note: bundle ? `Bundle · ${bundle.posts} posts` : undefined,
    });
    updateTags(tagsForMutation("booking", { brandId: auth.brandId, creatorId, campaignId, userIds: [auth.viewer.userId] }));
    revalidate();
    return { ok: true, data: { collaborationId: collab.id, status: collab.status, feeCents: collab.feeCents, acceptBy: collab.acceptBy?.toISOString() ?? null } };
  } catch (error) {
    return bookingError(error, { brandId: auth.brandId, campaignId, creatorId, option });
  }
}

// ---- negotiate ("Make an offer" → Send offer) -----------------------------------------

export async function sendOffer(input: unknown): Promise<ActionResult<BookingResultDto>> {
  const auth = await brandViewer();
  if (!auth) return UNAUTHORIZED;
  const parsed = sendOfferSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error), code: "invalid" };
  const { campaignId, creatorId, offerCents, discountPercent, postBy, approveBeforePublish, note } = parsed.data;
  if (!(await ownsCampaign(auth.brandId, campaignId))) return UNAUTHORIZED;

  try {
    const collab = await createCollaboration({
      campaignId,
      creatorId,
      origin: "invitation",
      feeCents: offerCents,
      discountPercent,
      dueDate: new Date(`${postBy}T23:59:59.000Z`),
      approveBeforePublish,
      note: note || undefined,
    });
    updateTags(tagsForMutation("booking", { brandId: auth.brandId, creatorId, campaignId, userIds: [auth.viewer.userId] }));
    revalidate();
    return { ok: true, data: { collaborationId: collab.id, status: collab.status, feeCents: collab.feeCents, acceptBy: collab.acceptBy?.toISOString() ?? null } };
  } catch (error) {
    return bookingError(error, { brandId: auth.brandId, campaignId, creatorId, offerCents });
  }
}

// ---- Nao · Creator intelligence -------------------------------------------------------

function requestedCount(prompt: string) {
  const match = /\b(\d{1,2})\s+(?:creators?|créat(?:eur|rice)s?)\b/i.exec(prompt);
  const n = match ? Number(match[1]) : MATCHING_DEFAULT_COUNT;
  return Math.min(MATCHING_MAX_COUNT, Math.max(1, n));
}

// Whole-word match only: "campaign" must not read as "AI".
function mentionedIndustries(prompt: string) {
  return INDUSTRIES.filter((industry) => {
    const escaped = industry.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&").replace(/\s+/g, "\\s*");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(prompt);
  });
}

export async function runMatching(input: unknown): Promise<ActionResult<MatchingResultDto>> {
  const auth = await brandViewer();
  if (!auth) return UNAUTHORIZED;
  const parsed = runMatchingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error), code: "invalid" };
  const { campaignId, prompt } = parsed.data;
  if (!(await ownsCampaign(auth.brandId, campaignId))) return UNAUTHORIZED;

  try {
    const ctx = await getMarketplaceContext(auth.viewer, campaignId);
    if (!ctx?.selectedCampaign) return { ok: false, error: `Create a campaign first so ${BRAND.copilot} has a brief to work from.`, code: "invalid" };
    const requested = requestedCount(prompt);
    const industries = mentionedIndustries(prompt);
    let ranked = industries.length ? await rankCreators(ctx, industries) : [];
    if (ranked.length < requested) ranked = await rankCreators(ctx, []);
    const creators = ranked.slice(0, requested);
    const written = await writeRationale({ locale: await getLocale(), company: ctx.company, campaignName: ctx.selectedCampaign.name, prompt, requested, creators });
    return {
      ok: true,
      data: {
        requested,
        intro: `Got it — I'm searching for ${requested} creators that fit your request.`,
        headline: `I found ${creators.length} creators for ${ctx.company}, ranked by relevance to your brief, then performance and cost.`,
        rationale: written.rationale,
        tradeoff: written.tradeoff,
        source: written.source,
        creators,
      },
    };
  } catch (error) {
    console.error("[marketplace] matching failed", { brandId: auth.brandId, campaignId, error });
    return { ok: false, error: `${BRAND.copilot} could not run this search. Please try again.`, code: "unknown" };
  }
}

// Thumbs up / down / copy on a Nao answer: one nao_feedback row, so the
// feedback is a record and not just a toast.
export async function recordNaoFeedback(input: unknown): Promise<ActionResult<{ saved: true }>> {
  const auth = await brandViewer();
  if (!auth) return UNAUTHORIZED;
  const parsed = naoFeedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error), code: "invalid" };
  try {
    await getDb().insert(naoFeedback).values({ brandId: auth.brandId, prompt: parsed.data.prompt, kind: parsed.data.kind, creatorIds: parsed.data.creatorIds });
    return { ok: true, data: { saved: true } };
  } catch (error) {
    console.error("[marketplace] copilot feedback failed", { brandId: auth.brandId, error });
    return { ok: false, error: "We couldn't save that feedback.", code: "unknown" };
  }
}
