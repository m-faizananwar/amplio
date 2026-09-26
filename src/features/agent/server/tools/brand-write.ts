import "server-only";
import { getBrandProfile, getCampaign } from "@/features/campaigns/server/read-campaigns";
import { getCreatorPicks } from "@/features/campaigns/server/read-creators";
import { payCollaboration, reviewDraft } from "@/features/collaborations/server/actions";
import { sendMessage } from "@/features/collaborations/server/messages-actions";
import { creatorsOnCampaign, listBrandCollaborations } from "@/features/collaborations/server/queries";
import { bookCreator } from "@/features/marketplace/server/actions";
import { topUpWallet } from "@/features/payouts/server/actions";
import { walletCentsNow } from "@/features/payouts/server/queries";
import { alreadyLine, splitOnCampaign } from "../../on-campaign";
import { arr, type ConfirmTool, euros, L, num, obj, str, type ToolContext } from "./types";

const MAX_BOOK = 5;
const CENTS = 100;
const MIN_TOPUP_EUROS = 500;
const brandId = (ctx: ToolContext) => ctx.viewer.brand?.id ?? "";
const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_BOOK) : []);
const own = async (ctx: ToolContext, id: unknown) => (typeof id === "string" ? (await listBrandCollaborations(brandId(ctx))).find((c) => c.id === id) ?? null : null);

const bookCreators: ConfirmTool = {
  name: "bookCreators", role: "brand", kind: "confirm", label: "Preparing the booking",
  description: "Invite up to 5 creators to a campaign at their listed price. Each fee is held from the wallet until they answer. Needs the user's confirmation.",
  parameters: obj({ campaignId: str("The campaign id"), creatorIds: arr("Creator ids from searchCreators") }, ["campaignId", "creatorIds"]),
  async prepare(ctx, a) {
    const creatorIds = ids(a.creatorIds);
    const [campaign, brand] = await Promise.all([getCampaign(brandId(ctx), String(a.campaignId ?? "")), getBrandProfile(brandId(ctx))]);
    if (!campaign || !brand) return { error: "That campaign isn't one of yours." };
    // the booking action refuses anything but an active campaign; say so before the card, not after
    if (campaign.status !== "active") return { error: `${campaign.name} is a ${campaign.status} campaign; only an active one can take bookings. Launch it first, or pick an active campaign.` };
    if (creatorIds.length === 0) return { error: "No creators to book." };
    const found = await getCreatorPicks(creatorIds, campaign, brand);
    if (found.length === 0) return { error: "Those creators weren't found." };
    // refuse up front, naming who is already on the campaign (any state)
    const { bookable: picks, already } = splitOnCampaign(found, await creatorsOnCampaign(campaign.id, found.map((p) => p.id)));
    if (picks.length === 0) return { error: `${alreadyLine(already, campaign.name, ctx.locale)} ${L(ctx, "Search again for others.", "Cherchez-en d’autres.")}` };
    const total = picks.reduce((s, p) => s + p.priceCents, 0);
    const wallet = await walletCentsNow(brandId(ctx));
    if (total > wallet) return { error: `The fees total ${euros(total, ctx.locale)} and the wallet has ${euros(wallet, ctx.locale)}. Top up first.`, nextSteps: [
      { label: L(ctx, "Top up the wallet", "Recharger le portefeuille"), hint: `Prepare topUp with amountEuros ${Math.max(MIN_TOPUP_EUROS, Math.ceil((total - wallet) / CENTS))} (the shortfall; €${MIN_TOPUP_EUROS} minimum).` },
      { label: L(ctx, "Book fewer creators", "Réserver moins de créateurs"), hint: "Ask which of these creators to keep with askUser, then prepare bookCreators again with only those." },
    ] };
    return {
      title: L(ctx, `Book ${picks.length} creator${picks.length > 1 ? "s" : ""} for ${campaign.name}`, `Réserver ${picks.length} créateur${picks.length > 1 ? "s" : ""} pour ${campaign.name}`),
      facts: [
        { label: "Creators", value: picks.map((p) => `${p.name} (${euros(p.priceCents, ctx.locale)})`).join(", ") },
        ...(already.length ? [{ label: "Already on it", value: already.map((p) => p.name).join(", ") }] : []),
        { label: "Held from your wallet", value: euros(total, ctx.locale), cents: total },
        { label: "Wallet after", value: euros(wallet - total, ctx.locale), cents: wallet - total },
      ],
      confirmLabel: picks.length > 1 ? "Book them" : "Book",
    };
  },
  async execute(ctx, a) {
    const [campaign, brand] = await Promise.all([getCampaign(brandId(ctx), String(a.campaignId ?? "")), getBrandProfile(brandId(ctx))]);
    const found = campaign && brand ? await getCreatorPicks(ids(a.creatorIds), campaign, brand) : [];
    const picks = campaign ? splitOnCampaign(found, await creatorsOnCampaign(campaign.id, found.map((p) => p.id))).bookable : [];
    const booked: typeof picks = [];
    let error = "";
    for (const p of picks) {
      const r = await bookCreator({ campaignId: a.campaignId, creatorId: p.id, option: "single" });
      if (r.ok) booked.push(p); else error = r.error;
    }
    const held = booked.reduce((s, p) => s + p.priceCents, 0);
    // the balance after the bookings, as the database now has it
    const wallet = await walletCentsNow(brandId(ctx));
    const who = booked.map((p) => `${p.name} (${euros(p.priceCents, ctx.locale)})`).join(", ");
    if (booked.length === 0) return { ok: false, summary: error || L(ctx, "no invitation went out", "aucune invitation n’est partie") };
    return { ok: true, summary: L(ctx, `Invited ${who}. ${euros(held, ctx.locale)} is held from your wallet, which now has ${euros(wallet, ctx.locale)}.`, `Invitations envoyées à ${who}. ${euros(held, ctx.locale)} est bloqué sur votre portefeuille, qui affiche maintenant ${euros(wallet, ctx.locale)}.`) + (booked.length < picks.length ? ` ${error}` : "") };
  },
};

const review = (decision: "approve" | "request_changes"): ConfirmTool => ({
  name: decision === "approve" ? "approveDraft" : "requestChanges", role: "brand", kind: "confirm",
  label: decision === "approve" ? "Preparing the approval" : "Preparing the change request",
  description: decision === "approve" ? "Approve a submitted draft so the creator can schedule it. Needs confirmation." : "Send a draft back with a note on what to change. Needs confirmation.",
  parameters: obj({ collaborationId: str("The collaboration id"), note: str("What should change (for a change request)") }, ["collaborationId"]),
  async prepare(ctx, a) {
    const c = await own(ctx, a.collaborationId);
    if (!c) return { error: "That collaboration isn't one of yours." };
    if (c.status !== "draft_submitted") return { error: `There's no draft waiting on ${c.creatorName}'s collaboration.` };
    return { title: decision === "approve" ? L(ctx, `Approve ${c.creatorName}'s draft`, `Approuver le brouillon de ${c.creatorName}`) : L(ctx, `Ask ${c.creatorName} for changes`, `Demander des modifications à ${c.creatorName}`), facts: [{ label: "Campaign", value: c.campaignName }, { label: "Creator", value: c.creatorName }, ...(a.note ? [{ label: "Note", value: String(a.note) }] : [])], confirmLabel: decision === "approve" ? "Approve" : "Send" };
  },
  async execute(ctx, a) {
    const r = await reviewDraft({ collaborationId: String(a.collaborationId), csrfToken: ctx.viewer.csrfToken, decision, note: String(a.note ?? "") });
    return { ok: r.ok, summary: r.ok ? (decision === "approve" ? L(ctx, "Draft approved. The creator can schedule it now.", "Brouillon approuvé. Le créateur peut le programmer.") : L(ctx, "Changes requested. The creator has your note.", "Modifications demandées. Le créateur a votre note.")) : r.error };
  },
});

const releasePayment: ConfirmTool = {
  name: "releasePayment", role: "brand", kind: "confirm", label: "Preparing the payment",
  description: "Release the held fee to the creator of a live post. Irreversible. Needs confirmation.",
  parameters: obj({ collaborationId: str("The collaboration id") }, ["collaborationId"]),
  async prepare(ctx, a) {
    const c = await own(ctx, a.collaborationId);
    if (!c) return { error: "That collaboration isn't one of yours." };
    if (c.status !== "live") return { error: "Only a live post's fee can be released." };
    return { title: L(ctx, `Pay ${c.creatorName}`, `Payer ${c.creatorName}`), facts: [{ label: "Campaign", value: c.campaignName }, { label: "Amount released", value: euros(c.feeCents, ctx.locale), cents: c.feeCents }], confirmLabel: `Release ${euros(c.feeCents, ctx.locale)}` };
  },
  async execute(ctx, a) {
    const c = await own(ctx, a.collaborationId);
    const r = await payCollaboration({ collaborationId: String(a.collaborationId), csrfToken: ctx.viewer.csrfToken });
    return { ok: r.ok, summary: r.ok ? L(ctx, `Paid ${c?.creatorName ?? "the creator"} ${c ? euros(c.feeCents, ctx.locale) : ""}.`, `${c ? euros(c.feeCents, ctx.locale) : ""} versés à ${c?.creatorName ?? "le créateur"}.`) : r.error };
  },
};

const topUp: ConfirmTool = {
  name: "topUp", role: "brand", kind: "confirm", label: "Preparing the top-up",
  description: "Add money to the wallet (a demo top-up: no card is charged in this build). Amount in euros. Needs confirmation.",
  parameters: obj({ amountEuros: num("How much to add, in euros (500 to 100000)") }, ["amountEuros"]),
  async prepare(ctx, a) {
    const cents = Math.round(Number(a.amountEuros) * 100);
    if (!Number.isFinite(cents) || cents <= 0) return { error: "How much should I add?" };
    const wallet = await walletCentsNow(brandId(ctx));
    return { title: L(ctx, "Top up the wallet", "Recharger le portefeuille"), facts: [{ label: "Amount", value: euros(cents, ctx.locale), cents }, { label: "Wallet after", value: euros(wallet + cents, ctx.locale), cents: wallet + cents }, { label: "Card", value: "None charged: demo top-up" }], confirmLabel: `Add ${euros(cents, ctx.locale)}` };
  },
  async execute(ctx, a) {
    const r = await topUpWallet({ amountCents: Math.round(Number(a.amountEuros) * 100) });
    return { ok: r.ok, summary: r.ok ? L(ctx, `Added. Your wallet now has ${euros(r.data.balanceCents, ctx.locale)} (a demo top-up, no card charged).`, `Ajouté. Votre portefeuille affiche ${euros(r.data.balanceCents, ctx.locale)} (rechargement de démonstration, aucune carte débitée).`) : r.error };
  },
};

export const messageTool = (role: "brand" | "creator"): ConfirmTool => ({
  name: "sendMessage", role, kind: "confirm", label: "Preparing the message",
  description: "Send a message in a collaboration's thread. Needs confirmation.",
  parameters: obj({ collaborationId: str("The collaboration id"), body: str("The message text") }, ["collaborationId", "body"]),
  async prepare(ctx, a) {
    const body = String(a.body ?? "").trim();
    if (!body) return { error: "What should the message say?" };
    return { title: L(ctx, "Send this message", "Envoyer ce message"), facts: [{ label: "Message", value: body }], confirmLabel: "Send" };
  },
  async execute(ctx, a) {
    const r = await sendMessage({ collaborationId: String(a.collaborationId), body: String(a.body), csrfToken: ctx.viewer.csrfToken });
    return { ok: r.ok, summary: r.ok ? L(ctx, "Message sent.", "Message envoyé.") : r.error };
  },
});

export const BRAND_WRITES = [bookCreators, review("approve"), review("request_changes"), releasePayment, topUp, messageTool("brand")];
