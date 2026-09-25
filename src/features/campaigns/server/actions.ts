"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { brands, campaigns, collaborations, ledgerEntries } from "@/db/schema";
import { getViewer } from "@/features/auth/server/session";
import { createCollaboration, DuplicateCollaborationError } from "@/features/collaborations/server/create";
import { InsufficientFundsError } from "@/features/collaborations/server/side-effects";
import { DAY_MS, DEFAULT_FEE_CENTS, DEFAULT_POST_DEADLINE_DAYS } from "../constants";
import {
  type ActionResult, basicsSchema, type BasicsInput, createFromAiSchema, type CreateFromAiInput, 
   inviteSchema, type InviteInput, type LaunchInput, type LaunchResultDto, launchSchema,
  saveBriefSchema, type SaveBriefInput,
} from "../schemas";
import { generateCampaignDraft } from "./brief-ai";
import { getBrandProfile, getCampaign, getCreatorPicks } from "./queries";

const NOT_SIGNED_IN = "Sign in as a brand to manage campaigns.";
const NOT_FOUND = "This campaign does not exist or belongs to another workspace.";
const GENERIC = "Something went wrong on our side. Nothing was saved — please try again.";

type Owned = { brandId: string; campaignId: string; ownerUserId: string };

async function ownedCampaign(campaignId: string): Promise<Owned | null> {
  const viewer = await getViewer();
  if (!viewer?.brand) return null;
  const campaign = await getCampaign(viewer.brand.id, campaignId);
  return campaign ? { brandId: viewer.brand.id, campaignId, ownerUserId: viewer.userId } : null;
}

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Invalid input";
}

function revalidateCampaign(owned: Owned) {
  updateTags(tagsForMutation("campaign", { brandId: owned.brandId, campaignId: owned.campaignId }));
  revalidatePath("/brand/campaigns");
  revalidatePath(`/brand/campaigns/${owned.campaignId}`, "layout");
}

async function createDraft(
  source: "ai" | "link",
  input: { prompt: string | null; url: string | null },
): Promise<ActionResult<{ campaignId: string; generatedWith: "ai" | "template" }>> {
  const viewer = await getViewer();
  if (!viewer?.brand) return { ok: false, error: NOT_SIGNED_IN };
  const brand = await getBrandProfile(viewer.brand.id);
  if (!brand) return { ok: false, error: NOT_SIGNED_IN };
  // The link is never fetched in this build: the template runs off the workspace profile.
  const { draft, generatedWith } = await generateCampaignDraft({ brand, prompt: input.prompt });
  const [row] = await getDb()
    .insert(campaigns)
    .values({
      brandId: brand.id,
      name: draft.name,
      description: draft.description,
      status: "draft",
      openToApplications: false,
      postDeadline: new Date(Date.now() + DEFAULT_POST_DEADLINE_DAYS * DAY_MS),
      defaultFeeCents: DEFAULT_FEE_CENTS,
      brief: draft.brief,
      source,
      sourcePrompt: input.prompt,
      sourceUrl: input.url,
    })
    .returning({ id: campaigns.id });
  updateTags(tagsForMutation("campaign", { brandId: brand.id, campaignId: row.id }));
  revalidatePath("/brand/campaigns");
  return { ok: true, data: { campaignId: row.id, generatedWith } };
}

export async function createCampaignFromAi(input: CreateFromAiInput) {
  const parsed = createFromAiSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  try {
    return await createDraft("ai", { prompt: parsed.data.prompt, url: null });
  } catch (error) {
    console.error("[campaigns] createCampaignFromAi failed", { error });
    return { ok: false as const, error: GENERIC };
  }
}


export async function updateCampaignBasics(input: BasicsInput): Promise<ActionResult<{ campaignId: string }>> {
  const parsed = basicsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { campaignId, name, description, postDeadline, defaultFeeCents } = parsed.data;
  try {
    const owned = await ownedCampaign(campaignId);
    if (!owned) return { ok: false, error: NOT_FOUND };
    await getDb()
      .update(campaigns)
      .set({ name, description, postDeadline: postDeadline ? new Date(`${postDeadline}T12:00:00Z`) : null, defaultFeeCents })
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, owned.brandId)));
    revalidateCampaign(owned);
    return { ok: true, data: { campaignId } };
  } catch (error) {
    console.error("[campaigns] updateCampaignBasics failed", { campaignId, error });
    return { ok: false, error: GENERIC };
  }
}

export async function saveBrief(input: SaveBriefInput): Promise<ActionResult<{ campaignId: string }>> {
  const parsed = saveBriefSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { campaignId, brief } = parsed.data;
  try {
    const owned = await ownedCampaign(campaignId);
    if (!owned) return { ok: false, error: NOT_FOUND };
    await getDb().update(campaigns).set({ brief }).where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, owned.brandId)));
    revalidateCampaign(owned);
    return { ok: true, data: { campaignId } };
  } catch (error) {
    console.error("[campaigns] saveBrief failed", { campaignId, error });
    return { ok: false, error: GENERIC };
  }
}

// One funded invitation. Wallet short → the creator goes to `unfunded`;
// already on the campaign → `skipped`. Nothing here throws to the caller.
async function inviteOne(campaignId: string, creator: { id: string; name: string; priceCents: number }, result: LaunchResultDto) {
  try {
    await createCollaboration({ campaignId, creatorId: creator.id, origin: "invitation" });
    result.invited.push(creator.id);
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      result.unfunded.push({ creatorId: creator.id, name: creator.name, shortfallCents: error.shortfallCents });
      return;
    }
    if (error instanceof DuplicateCollaborationError) {
      result.skipped.push({ creatorId: creator.id, name: creator.name, reason: "duplicate" });
      return;
    }
    console.error("[campaigns] invitation failed", { campaignId, creatorId: creator.id, error });
    result.skipped.push({ creatorId: creator.id, name: creator.name, reason: "failed" });
  }
}

export async function launchCampaign(input: LaunchInput): Promise<ActionResult<LaunchResultDto>> {
  const parsed = launchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { campaignId, creatorIds } = parsed.data;
  try {
    const viewer = await getViewer();
    if (!viewer?.brand) return { ok: false, error: NOT_SIGNED_IN };
    const [campaign, brand] = await Promise.all([getCampaign(viewer.brand.id, campaignId), getBrandProfile(viewer.brand.id)]);
    if (!campaign || !brand) return { ok: false, error: NOT_FOUND };
    const picks = await getCreatorPicks(creatorIds, campaign, brand);
    // Cheapest first so a short wallet still funds as many creators as it can.
    picks.sort((a, b) => a.priceCents - b.priceCents);

    await getDb()
      .update(campaigns)
      .set({ status: "active", openToApplications: true })
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, brand.id)));
    const result: LaunchResultDto = { campaignId, invited: [], unfunded: [], skipped: [] };
    for (const creator of picks) await inviteOne(campaignId, creator, result);
    // Each invitation holds a fee and lands in a creator's workspace, so both
    // sides and the brand's wallet are dropped, not just the campaign.
    for (const creatorId of result.invited) {
      updateTags(tagsForMutation("booking", { brandId: brand.id, campaignId, creatorId, userIds: [viewer.userId] }));
    }
    revalidateCampaign({ brandId: brand.id, campaignId, ownerUserId: viewer.userId });
    revalidatePath("/brand", "layout");
    return { ok: true, data: result };
  } catch (error) {
    console.error("[campaigns] launchCampaign failed", { campaignId, error });
    return { ok: false, error: GENERIC };
  }
}

export async function inviteCreator(input: InviteInput): Promise<ActionResult<{ collaborationId: string }>> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { campaignId, creatorId } = parsed.data;
  try {
    const owned = await ownedCampaign(campaignId);
    if (!owned) return { ok: false, error: NOT_FOUND };
    const collab = await createCollaboration({ campaignId, creatorId, origin: "invitation" });
    updateTags(tagsForMutation("booking", { brandId: owned.brandId, campaignId, creatorId }));
    revalidateCampaign(owned);
    revalidatePath("/brand", "layout");
    return { ok: true, data: { collaborationId: collab.id } };
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return { ok: false, error: `Your wallet is short by €${(error.shortfallCents / 100).toFixed(2)} for this invitation. Top up from Billing.` };
    }
    if (error instanceof DuplicateCollaborationError) return { ok: false, error: "This creator is already on this campaign." };
    console.error("[campaigns] inviteCreator failed", { campaignId, creatorId, error });
    return { ok: false, error: GENERIC };
  }
}

// Deleting a campaign cascades to its collaborations, tracking links, clicks
// and messages. Pending booking holds are released so the wallet cache stays
// equal to the ledger. Blocked while any collaboration is live or paid — those
// carry money and attribution that must stay auditable.
export async function deleteCampaign(campaignId: string): Promise<ActionResult<{ deleted: true }>> {
  const owned = await ownedCampaign(campaignId);
  if (!owned) return { ok: false, error: NOT_FOUND };
  const db = getDb();
  try {
    const rows = await db
      .select({ id: collaborations.id, status: collaborations.status })
      .from(collaborations)
      .where(eq(collaborations.campaignId, campaignId));
    if (rows.some((r) => r.status === "live" || r.status === "paid")) {
      return { ok: false, error: "This campaign has published or paid posts, so it can't be deleted. Mark it completed instead." };
    }
    await db.transaction(async (tx) => {
      const ids = rows.map((r) => r.id);
      if (ids.length > 0) {
        const held = await tx
          .delete(ledgerEntries)
          .where(and(inArray(ledgerEntries.collaborationId, ids), eq(ledgerEntries.type, "booking"), eq(ledgerEntries.status, "pending")))
          .returning({ amountCents: ledgerEntries.amountCents });
        const refund = held.reduce((sum, r) => sum - r.amountCents, 0);
        if (refund > 0) await tx.update(brands).set({ walletCents: sql`${brands.walletCents} + ${refund}` }).where(eq(brands.id, owned.brandId));
      }
      await tx.delete(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.brandId, owned.brandId)));
    });
  } catch (error) {
    console.error("[campaigns] deleteCampaign failed", { campaignId, error });
    return { ok: false, error: GENERIC };
  }
  // A delete refunds held fees, so the wallet in the shell goes too.
  updateTags(tagsForMutation("campaign", { brandId: owned.brandId, campaignId, userIds: [owned.ownerUserId] }));
  revalidatePath("/brand/campaigns");
  revalidatePath("/brand", "layout");
  return { ok: true, data: { deleted: true } };
}
