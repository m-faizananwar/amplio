import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import { listCampaignSummaries } from "@/features/campaigns/server/read-campaigns";
import { listOpportunities } from "@/features/collaborations/server/opportunities-queries";
import { listBrandCollaborations, listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { getEarningsSummary } from "@/features/payouts/server/queries";
import { STATUS_LABELS } from "@/lib/collaboration-labels";
import { formatEuros } from "@/lib/money";
import { CONTEXT_LIST_MAX } from "../constants";
import { PRODUCT_FACTS } from "../facts";

const ACTION_STATUSES = new Set(["applied", "draft_submitted", "approved", "live"]);

// What a visitor can ask about: only what the product does (../facts.ts).
export function publicContext(): string {
  return PRODUCT_FACTS.join("\n");
}

type Eur = (cents: number) => string;

// A compact, read-only picture of the signed-in user's workspace, amounts in
// the reader's locale (the model repeats them as written).
export async function viewerContext(viewer: Viewer, locale: "en" | "fr" = "en"): Promise<string> {
  const eur: Eur = (cents) => formatEuros(cents, locale);
  const who = `Signed in: ${viewer.firstName} ${viewer.lastName}, role ${viewer.role}.`;
  if (viewer.brand) return [who, ...(await brandLines(viewer.brand, eur))].join("\n");
  if (viewer.creator) return [who, ...(await creatorLines(viewer.creator.id, eur))].join("\n");
  return who;
}

async function brandLines({ id: brandId, company, walletCents }: { id: string; company: string; walletCents: number }, eur: Eur): Promise<string[]> {
  const [campaigns, collabs] = await Promise.all([listCampaignSummaries(brandId), listBrandCollaborations(brandId)]);
  const pending = collabs.filter((c) => ACTION_STATUSES.has(c.status)).slice(0, CONTEXT_LIST_MAX);
  return [
    `Workspace: ${company}. Wallet balance ${eur(walletCents)}.`,
    `Campaigns (${campaigns.length}): ${campaigns.slice(0, CONTEXT_LIST_MAX).map((c) => `${c.name} [${c.status}]`).join("; ") || "none yet"}.`,
    `Collaborations needing attention (${pending.length}): ${pending.map((c) => `${c.creatorName} on ${c.campaignName} — ${STATUS_LABELS[c.status]}`).join("; ") || "none"}.`,
  ];
}

async function creatorLines(creatorId: string, eur: Eur): Promise<string[]> {
  const [opps, collabs, earnings] = await Promise.all([listOpportunities(creatorId), listCreatorCollaborations(creatorId), getEarningsSummary(creatorId)]);
  const active = collabs.filter((c) => c.status !== "paid" && c.status !== "declined").slice(0, CONTEXT_LIST_MAX);
  return [
    `Open opportunities (${opps.length}): ${opps.slice(0, CONTEXT_LIST_MAX).map((o) => `${o.campaignName} by ${o.brandCompany}`).join("; ") || "none right now"}.`,
    `Active collaborations (${active.length}): ${active.map((c) => `${c.campaignName} (${c.brandCompany}) — ${STATUS_LABELS[c.status]}, ${eur(c.feeCents)}`).join("; ") || "none"}.`,
    // Spelled out: "awaiting release" is not money the creator can withdraw yet.
    `Earnings: ${eur(earnings.availableCents)} available to withdraw now. ${eur(earnings.awaitingReleaseCents)} is awaiting release (brands still have to pay it; it cannot be withdrawn yet). ${eur(earnings.totalEarnedCents)} earned in total over ${earnings.paidCollaborations} paid collaborations; ${eur(earnings.withdrawnCents)} already withdrawn.`,
  ];
}
