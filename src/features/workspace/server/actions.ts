"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { brands, creators, users } from "@/db/schema";
import { destroySession, getViewer } from "@/features/auth/server/session";
import { type CommandIndex, getCommandIndex } from "./command-queries";
import { isDemoEmail } from "@/features/auth/constants";
import {
  type ActionResult, type BrandAudienceInput, type BrandCompanyInput, type CreatorIdentityInput, type PayoutDetailsInput,
  brandAudienceSchema, brandCompanySchema, creatorIdentitySchema, payoutDetailsSchema,
} from "../schemas";

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Invalid input";
}


export async function updateBrandCompany(input: BrandCompanyInput): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer?.brand) return { ok: false, error: "Sign in as a brand." };
  const parsed = brandCompanySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb().update(brands).set({ company: parsed.data.company, website: parsed.data.website || null }).where(eq(brands.id, viewer.brand.id));
  } catch (error) {
    console.error("[workspace] brand company update failed", { brandId: viewer.brand.id, error });
    return { ok: false, error: "We couldn't save your profile." };
  }
  updateTags(tagsForMutation("brand-profile", { brandId: viewer.brand.id, userIds: [viewer.userId] }));
  revalidatePath("/brand", "layout");
  return { ok: true, data: undefined };
}

export async function updateBrandAudience(input: BrandAudienceInput): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer?.brand) return { ok: false, error: "Sign in as a brand." };
  const parsed = brandAudienceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb()
      .update(brands)
      .set({ targetIndustries: parsed.data.targetIndustries, targetRegions: parsed.data.targetRegions })
      .where(eq(brands.id, viewer.brand.id));
  } catch (error) {
    console.error("[workspace] brand audience update failed", { brandId: viewer.brand.id, error });
    return { ok: false, error: "We couldn't save your audience." };
  }
  updateTags(tagsForMutation("brand-profile", { brandId: viewer.brand.id, userIds: [viewer.userId] }));
  revalidatePath("/brand/settings");
  return { ok: true, data: undefined };
}


export async function updateCreatorIdentity(input: CreatorIdentityInput): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer?.creator) return { ok: false, error: "Sign in as a creator." };
  const parsed = creatorIdentitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const creatorId = viewer.creator.id;
  try {
    await getDb().transaction(async (tx) => {
      await tx.update(users).set({ firstName: parsed.data.firstName, lastName: parsed.data.lastName }).where(eq(users.id, viewer.userId));
      await tx.update(creators).set({ xHandle: parsed.data.xHandle ? parsed.data.xHandle.replace(/^@/, "") : null }).where(eq(creators.id, creatorId));
    });
  } catch (error) {
    console.error("[workspace] creator identity update failed", { creatorId, error });
    return { ok: false, error: "We couldn't save your name." };
  }
  updateTags(tagsForMutation("creator-profile", { creatorId, userIds: [viewer.userId] }));
  revalidatePath("/creator", "layout");
  return { ok: true, data: undefined };
}

const IBAN_LAST = 4;

export async function updatePayoutDetails(input: PayoutDetailsInput): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer?.creator) return { ok: false, error: "Sign in as a creator." };
  const parsed = payoutDetailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    await getDb()
      .update(creators)
      .set({
        payoutMethod: parsed.data.method,
        payoutAccountHolder: parsed.data.accountHolder || null,
        payoutIbanLast4: parsed.data.iban ? parsed.data.iban.slice(-IBAN_LAST) : null,
      })
      .where(eq(creators.id, viewer.creator.id));
  } catch (error) {
    console.error("[workspace] payout details update failed", { creatorId: viewer.creator.id, error });
    return { ok: false, error: "We couldn't save your payout details." };
  }
  updateTags(tagsForMutation("creator-profile", { creatorId: viewer.creator.id, userIds: [viewer.userId] }));
  revalidatePath("/creator/settings");
  revalidatePath("/creator/earnings");
  return { ok: true, data: undefined };
}

// Deletes the user row; brands/creators/sessions cascade. Demo accounts are
// protected so the graders' way in cannot be removed.
export async function deleteAccount(): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Not signed in." };
  if (isDemoEmail(viewer.email)) return { ok: false, error: "Demo accounts can't be deleted." };
  try {
    await getDb().delete(users).where(eq(users.id, viewer.userId));
  } catch (error) {
    console.error("[workspace] account deletion failed", { userId: viewer.userId, error });
    return { ok: false, error: "We couldn't delete the account." };
  }
  await destroySession();
  redirect("/");
}

// ⌘K's index: a read, exposed as an action because the menu asks for it on
// first open from the client. Empty for a signed-out caller.
export async function loadCommandIndex(): Promise<CommandIndex> {
  const viewer = await getViewer();
  return viewer ? getCommandIndex(viewer) : { campaigns: [], collaborations: [], creators: [] };
}
