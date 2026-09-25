"use server";

import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { updateTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { brands, ledgerEntries } from "@/db/schema";
import { getViewer } from "@/features/auth/server/session";
import { BILLING_PATH, EARNINGS_PATH } from "../constants";
import { type ActionResult, type LedgerRowDto, type TopUpInput, topUpSchema, type WithdrawInput, withdrawSchema } from "../schemas";
import { getEarningsSummary, toLedgerDto } from "./queries";

const REF_BYTES = 3;

function reference(prefix: string) {
  return `${prefix}-${randomBytes(REF_BYTES).toString("hex").toUpperCase()}`;
}

// Withdrawal = a completed ledger row. There is no Stripe or bank rail in this
// build; the README says so. The balance check is the real part.
export async function withdrawEarnings(input: WithdrawInput): Promise<ActionResult<{ availableCents: number }>> {
  const viewer = await getViewer();
  if (!viewer?.creator) return { ok: false, error: "Sign in as a creator to withdraw." };
  const parsed = withdrawSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid amount" };

  const summary = await getEarningsSummary(viewer.creator.id);
  if (parsed.data.amountCents > summary.availableCents) {
    return { ok: false, error: "That is more than your available balance." };
  }
  try {
    await getDb().insert(ledgerEntries).values({
      creatorId: viewer.creator.id,
      type: "withdrawal",
      // Bank transfers take 1-7 days and show as "In transit"; Stripe settles instantly.
      status: parsed.data.method === "bank" ? "pending" : "completed",
      amountCents: -parsed.data.amountCents,
      reference: reference("WD"),
      description: parsed.data.method === "stripe" ? "Withdrawal · Stripe (instant)" : "Withdrawal · Bank transfer",
    });
  } catch (error) {
    console.error("[payouts] withdrawal failed", { creatorId: viewer.creator.id, error });
    return { ok: false, error: "We couldn't record the withdrawal. Nothing was moved." };
  }
  updateTags(tagsForMutation("withdraw", { creatorId: viewer.creator.id, userIds: [viewer.userId] }));
  revalidatePath(EARNINGS_PATH);
  revalidatePath("/creator", "layout");
  return { ok: true, data: { availableCents: summary.availableCents - parsed.data.amountCents } };
}

// Top-up = a completed `topup` ledger row plus the wallet cache on the brand,
// in one transaction so brands.wallet_cents always equals the ledger sum.
// No Stripe: the dialog says "No card — demo top-up" and the README says so.
export async function topUpWallet(input: TopUpInput): Promise<ActionResult<{ balanceCents: number; row: LedgerRowDto }>> {
  const viewer = await getViewer();
  if (!viewer?.brand) return { ok: false, error: "Sign in as a brand to add budget." };
  const parsed = topUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid amount" };
  const brandId = viewer.brand.id;
  const amountCents = parsed.data.amountCents;
  try {
    const result = await getDb().transaction(async (tx) => {
      const [row] = await tx
        .insert(ledgerEntries)
        .values({ brandId, type: "topup", status: "completed", amountCents, reference: reference("TU"), description: "Top-up · demo (no card)" })
        .returning();
      const [brand] = await tx
        .update(brands)
        .set({ walletCents: sql`${brands.walletCents} + ${amountCents}` })
        .where(eq(brands.id, brandId))
        .returning({ walletCents: brands.walletCents });
      if (!row || !brand) throw new Error("top-up wrote nothing");
      return { balanceCents: brand.walletCents, row: toLedgerDto(row) };
    });
    updateTags(tagsForMutation("top-up", { brandId, userIds: [viewer.userId] }));
    revalidatePath(BILLING_PATH);
    revalidatePath("/brand", "layout");
    return { ok: true, data: result };
  } catch (error) {
    console.error("[payouts] top-up failed", { brandId, amountCents, error });
    return { ok: false, error: "We couldn't credit your balance. Nothing was charged." };
  }
}
