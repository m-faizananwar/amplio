import "server-only";
import { applyToCampaign, decideInvitation, submitDraft } from "@/features/collaborations/server/actions";
import { listOpportunities } from "@/features/collaborations/server/opportunities-queries";
import { listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { getEarningsSummary } from "@/features/payouts/server/queries";
import { getPublicCard } from "@/features/workspace/server/card-queries";
import { filterFor } from "@/lib/next-step";
import { DRAFT_PREVIEW_MAX } from "../../constants";
import { messageTool } from "./brand-write";
import { type ConfirmTool, euros, obj, type ReadTool, str, type ToolContext } from "./types";

const LIST_LIMIT = 8;
const creatorId = (ctx: ToolContext) => ctx.viewer.creator?.id ?? "";
const own = async (ctx: ToolContext, id: unknown) => (typeof id === "string" ? (await listCreatorCollaborations(creatorId(ctx))).find((c) => c.id === id) ?? null : null);

const getMyCard: ReadTool = {
  name: "getMyCard", role: "creator", kind: "read", label: "Reading your card",
  description: "The creator's public card: headline, country, industries, followers, price per post.",
  parameters: obj({}),
  async run(ctx) {
    const card = await getPublicCard(ctx.viewer.creator?.handle ?? "");
    if (!card) return { summary: "no card", data: null };
    const item = { id: creatorId(ctx), handle: card.handle, name: card.name, headline: card.headline, country: card.country, industries: card.industries, followers: card.followers, priceCents: card.priceCents, avatarUrl: card.avatarUrl };
    return { summary: `${card.name} · ${euros(card.priceCents, ctx.locale)} per post`, data: item, result: { type: "result", kind: "creator", title: "Your card", item } };
  },
};

const getOpportunities: ReadTool = {
  name: "listOpportunities", role: "creator", kind: "read", label: "Reading open campaigns",
  description: "Open campaigns the creator can apply to, best fit first, with brand, fit score, price and deadline. Optional minimum fit.",
  parameters: obj({ minFit: { type: "number", description: "Minimum fit score 0–100" } }),
  async run(ctx, a) {
    const rows = await listOpportunities(creatorId(ctx));
    const min = typeof a.minFit === "number" ? a.minFit : 0;
    const open = rows.filter((o) => !o.existingCollaborationId && o.matchScore >= min).sort((x, y) => y.matchScore - x.matchScore).slice(0, LIST_LIMIT);
    const items = open.map((o) => ({ campaignId: o.campaignId, campaign: o.campaignName, brand: o.brandCompany, fitScore: o.matchScore, priceCents: o.listPriceCents, postDeadline: o.postDeadline }));
    return { summary: `${rows.length} open · ${items.length} shown`, data: items, result: { type: "result", kind: "opportunities", title: "Open campaigns", items } };
  },
};

const getCollaborations: ReadTool = {
  name: "listCollaborations", role: "creator", kind: "read", label: "Reading your collaborations",
  description: "The creator's collaborations with status and who acts next. Optional filter: needs_you, waiting, live, done.",
  parameters: obj({ filter: str("needs_you | waiting | live | done") }),
  async run(ctx, a) {
    const rows = await listCreatorCollaborations(creatorId(ctx));
    const f = typeof a.filter === "string" ? a.filter : null;
    const items = rows.filter((c) => !f || filterFor(c.status, "creator") === f).map((c) => ({ id: c.id, campaign: c.campaignName, counterpart: c.brandCompany, status: c.status, nextAction: filterFor(c.status, "creator"), feeCents: c.feeCents }));
    return { summary: `${items.length} collaborations`, data: items, result: { type: "result", kind: "collaborations", title: "Your collaborations", items } };
  },
};

const getEarnings: ReadTool = {
  name: "getEarnings", role: "creator", kind: "read", label: "Reading your earnings",
  description: "Available to withdraw, awaiting release, withdrawn and earned to date, in cents.",
  parameters: obj({}),
  async run(ctx) {
    const s = await getEarningsSummary(creatorId(ctx));
    const item = { availableCents: s.availableCents, awaitingCents: s.awaitingReleaseCents, withdrawnCents: s.withdrawnCents, earnedCents: s.totalEarnedCents };
    return { summary: `${euros(item.availableCents, ctx.locale)} available`, data: item, result: { type: "result", kind: "earnings", title: "Earnings", item } };
  },
};

const apply: ConfirmTool = {
  name: "applyToCampaign", role: "creator", kind: "confirm", label: "Preparing the application",
  description: "Apply to an open campaign at the creator's own price. Needs confirmation.",
  parameters: obj({ campaignId: str("The campaign id from listOpportunities") }, ["campaignId"]),
  async prepare(ctx, a) {
    const o = (await listOpportunities(creatorId(ctx))).find((x) => x.campaignId === a.campaignId);
    if (!o) return { error: "That campaign isn't open to you." };
    if (o.existingCollaborationId) return { error: "You already have a collaboration on that campaign." };
    return { title: `Apply to ${o.campaignName}`, facts: [{ label: "Brand", value: o.brandCompany }, { label: "Your price", value: euros(o.listPriceCents, ctx.locale), cents: o.listPriceCents }, { label: "Post deadline", value: o.postDeadline ?? "—" }], confirmLabel: "Apply" };
  },
  async execute(ctx, a) {
    const r = await applyToCampaign({ campaignId: String(a.campaignId), csrfToken: ctx.viewer.csrfToken });
    return { ok: r.ok, summary: r.ok ? "application sent" : r.error };
  },
};

const decide = (decision: "accept" | "decline"): ConfirmTool => ({
  name: decision === "accept" ? "acceptInvitation" : "declineInvitation", role: "creator", kind: "confirm",
  label: decision === "accept" ? "Preparing to accept" : "Preparing to decline",
  description: decision === "accept" ? "Accept a brand's invitation (the fee is already held). Needs confirmation." : "Decline a brand's invitation; the brand gets its fee back. Needs confirmation.",
  parameters: obj({ collaborationId: str("The collaboration id") }, ["collaborationId"]),
  async prepare(ctx, a) {
    const c = await own(ctx, a.collaborationId);
    if (!c) return { error: "That collaboration isn't yours." };
    if (c.status !== "invited") return { error: "There's no open invitation on that collaboration." };
    return { title: `${decision === "accept" ? "Accept" : "Decline"} ${c.brandCompany}'s invitation`, facts: [{ label: "Campaign", value: c.campaignName }, { label: "Fee", value: euros(c.feeCents, ctx.locale), cents: c.feeCents }], confirmLabel: decision === "accept" ? "Accept" : "Decline" };
  },
  async execute(ctx, a) {
    const r = await decideInvitation({ collaborationId: String(a.collaborationId), csrfToken: ctx.viewer.csrfToken, decision });
    return { ok: r.ok, summary: r.ok ? `invitation ${decision === "accept" ? "accepted" : "declined"}` : r.error };
  },
});

const draft: ConfirmTool = {
  name: "submitDraft", role: "creator", kind: "confirm", label: "Preparing the draft",
  description: "Submit the post draft for the brand to review. The text must be the creator's own words. Needs confirmation.",
  parameters: obj({ collaborationId: str("The collaboration id"), draftText: str("The full post text") }, ["collaborationId", "draftText"]),
  async prepare(ctx, a) {
    const c = await own(ctx, a.collaborationId);
    if (!c) return { error: "That collaboration isn't yours." };
    if (!["accepted", "changes_requested"].includes(c.status)) return { error: "That collaboration isn't waiting on a draft." };
    return { title: `Send the draft to ${c.brandCompany}`, facts: [{ label: "Campaign", value: c.campaignName }, { label: "Draft", value: String(a.draftText ?? "").slice(0, DRAFT_PREVIEW_MAX) }], confirmLabel: "Send the draft" };
  },
  async execute(ctx, a) {
    const r = await submitDraft({ collaborationId: String(a.collaborationId), csrfToken: ctx.viewer.csrfToken, draftText: String(a.draftText ?? "") });
    return { ok: r.ok, summary: r.ok ? "draft submitted" : r.error };
  },
};

export const CREATOR_TOOLS = [getMyCard, getOpportunities, getCollaborations, getEarnings, apply, decide("accept"), decide("decline"), draft, messageTool("creator")];
