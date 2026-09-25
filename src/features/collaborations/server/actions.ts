"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { campaigns } from "@/db/schema";
import type { Viewer } from "@/features/auth/server/session";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import {
  type ActionResult,
  type ApplyInput,
  type DecisionInput,
  type PayInput,
  type PublishInput,
  type ReviewInput,
  type ScheduleInput,
  type SubmitDraftInput,
  applySchema,
  decisionSchema,
  paySchema,
  publishSchema,
  reviewSchema,
  scheduleSchema,
  submitDraftSchema,
} from "../schemas";
import { collaborationScope } from "./cache-scope";
import { createCollaboration } from "./create";
import { NOT_YOURS, authorize, friendlyError, ownedCollaborationId } from "./ownership";
import { type TransitionInput, transition } from "./transition";

type StatusResult = ActionResult<{ collaborationId: string; status: CollaborationStatus }>;

// Both workspaces show the same row, so both get revalidated.
function revalidateCollaboration(collaborationId: string) {
  for (const root of ["/creator", "/brand"]) {
    revalidatePath(`${root}/collaborations`);
    revalidatePath(`${root}/collaborations/${collaborationId}`);
    revalidatePath(`${root}/messages`);
  }
  revalidatePath("/creator/opportunities");
}

// Every status change goes through here: ownership, then transition(), then
// the friendly-error mapping. The event/actor pair is what the state machine
// checks; nothing here decides what is legal.
async function runTransition(
  viewer: Viewer,
  collaborationId: string,
  input: Omit<TransitionInput, "collaborationId" | "actor">,
): Promise<StatusResult> {
  const owned = await ownedCollaborationId(viewer, collaborationId);
  if (!owned) return { ok: false, error: NOT_YOURS };
  try {
    const scope = await collaborationScope(collaborationId);
    const updated = await transition({ collaborationId, actor: viewer.role, ...input });
    updateTags(tagsForMutation("collaboration-status", scope));
    revalidateCollaboration(collaborationId);
    return { ok: true, data: { collaborationId, status: updated.status } };
  } catch (error) {
    return friendlyError(error, { collaborationId, event: input.event, actor: viewer.role });
  }
}

// ---- creator ------------------------------------------------------------------

export async function applyToCampaign(input: ApplyInput): Promise<StatusResult> {
  const auth = await authorize(applySchema, input, "creator");
  if (!auth.ok) return auth;
  const creatorId = auth.viewer.creator?.id;
  if (!creatorId) return { ok: false, error: "Finish your creator profile before applying." };

  const [campaign] = await getDb()
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.id, auth.data.campaignId), eq(campaigns.status, "active"), eq(campaigns.openToApplications, true)));
  if (!campaign) return { ok: false, error: "This campaign is no longer open to applications." };

  try {
    const collab = await createCollaboration({ campaignId: campaign.id, creatorId, origin: "application" });
    updateTags(tagsForMutation("booking", await collaborationScope(collab.id)));
    revalidateCollaboration(collab.id);
    return { ok: true, data: { collaborationId: collab.id, status: collab.status } };
  } catch (error) {
    return friendlyError(error, { campaignId: campaign.id, creatorId, event: "apply" });
  }
}

export async function decideInvitation(input: DecisionInput): Promise<StatusResult> {
  const auth = await authorize(decisionSchema, input, "creator");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, { event: auth.data.decision });
}

export async function submitDraft(input: SubmitDraftInput): Promise<StatusResult> {
  const auth = await authorize(submitDraftSchema, input, "creator");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, {
    event: "submit_draft",
    patch: { draftText: auth.data.draftText },
  });
}

export async function schedulePost(input: ScheduleInput): Promise<StatusResult> {
  const auth = await authorize(scheduleSchema, input, "creator");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, {
    event: "schedule",
    patch: { scheduledAt: new Date(auth.data.scheduledAt) },
  });
}

export async function publishPost(input: PublishInput): Promise<StatusResult> {
  const auth = await authorize(publishSchema, input, "creator");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, { event: "publish", patch: { postUrl: auth.data.postUrl } });
}

// ---- brand --------------------------------------------------------------------

export async function decideApplication(input: DecisionInput): Promise<StatusResult> {
  const auth = await authorize(decisionSchema, input, "brand");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, { event: auth.data.decision });
}

export async function reviewDraft(input: ReviewInput): Promise<StatusResult> {
  const auth = await authorize(reviewSchema, input, "brand");
  if (!auth.ok) return auth;
  const { decision, note } = auth.data;
  return runTransition(auth.viewer, auth.data.collaborationId, {
    event: decision,
    note: note || undefined,
    // An approval clears the previous round's note; a change request replaces it.
    patch: { reviewNote: decision === "request_changes" ? note : null },
  });
}

export async function payCollaboration(input: PayInput): Promise<StatusResult> {
  const auth = await authorize(paySchema, input, "brand");
  if (!auth.ok) return auth;
  return runTransition(auth.viewer, auth.data.collaborationId, { event: "pay" });
}
