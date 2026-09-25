import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import { listCampaignSummaries } from "@/features/campaigns/server/read-campaigns";
import { listOpportunities } from "@/features/collaborations/server/opportunities-queries";
import { listBrandCollaborations, listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { getEarningsSummary } from "@/features/payouts/server/queries";
import { STATUS_LABELS } from "@/lib/collaboration-labels";
import { formatCents } from "@/lib/money";
import { CONTEXT_LIST_MAX } from "../constants";
import { PRODUCT_FACTS } from "../facts";

const eur = (cents: number) => formatCents(cents, "EUR", "de-DE");
const ACTION_STATUSES = new Set(["applied", "draft_submitted", "approved", "live"]);

// What a visitor can ask about: only what the product does (../facts.ts).
export function publicContext(): string {
  return PRODUCT_FACTS.join("\n");
}

// A compact, read-only picture of the signed-in user's workspace.
export async function viewerContext(viewer: Viewer): Promise<string> {
  const who = `Signed in: ${viewer.firstName} ${viewer.lastName}, role ${viewer.role}.`;
  if (viewer.brand) return [who, ...(await brandLines(viewer.brand.id, viewer.brand.company, viewer.brand.walletCents))].join("\n");
  if (viewer.creator) return [who, ...(await creatorLines(viewer.creator.id))].join("\n");
  return who;
}

async function brandLines(brandId: string, company: string, walletCents: number): Promise<string[]> {
  const [campaigns, collabs] = await Promise.all([listCampaignSummaries(brandId), listBrandCollaborations(brandId)]);
  const pending = collabs.filter((c) => ACTION_STATUSES.has(c.status)).slice(0, CONTEXT_LIST_MAX);
  return [
    `Workspace: ${company}. Wallet balance ${eur(walletCents)}.`,
    `Campaigns (${campaigns.length}): ${campaigns.slice(0, CONTEXT_LIST_MAX).map((c) => `${c.name} [${c.status}]`).join("; ") || "none yet"}.`,
    `Collaborations needing attention (${pending.length}): ${pending.map((c) => `${c.creatorName} on ${c.campaignName} — ${STATUS_LABELS[c.status]}`).join("; ") || "none"}.`,
  ];
}

async function creatorLines(creatorId: string): Promise<string[]> {
  const [opps, collabs, earnings] = await Promise.all([listOpportunities(creatorId), listCreatorCollaborations(creatorId), getEarningsSummary(creatorId)]);
  const active = collabs.filter((c) => c.status !== "paid" && c.status !== "declined").slice(0, CONTEXT_LIST_MAX);
  return [
    `Open opportunities (${opps.length}): ${opps.slice(0, CONTEXT_LIST_MAX).map((o) => `${o.campaignName} by ${o.brandCompany}`).join("; ") || "none right now"}.`,
    `Active collaborations (${active.length}): ${active.map((c) => `${c.campaignName} (${c.brandCompany}) — ${STATUS_LABELS[c.status]}, ${eur(c.feeCents)}`).join("; ") || "none"}.`,
    `Earnings: total ${eur(earnings.totalEarnedCents)} over ${earnings.paidCollaborations} paid collaborations, ${eur(earnings.awaitingReleaseCents)} awaiting release, ${eur(earnings.withdrawnCents)} withdrawn.`,
  ];
}
