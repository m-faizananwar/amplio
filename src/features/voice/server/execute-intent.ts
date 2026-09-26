import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import { applyToCampaign, reviewDraft, submitDraft } from "@/features/collaborations/server/actions";
import { bookCreator } from "@/features/marketplace/server/actions";
import { topUpWallet } from "@/features/payouts/server/actions";
import { formatEuros } from "@/lib/money";
import { GATED_TOOLS, ROUTES } from "../constants";
import type { VoiceIntent, VoiceOutcome } from "../schemas";
import {
  findBrandCollaboration,
  findCampaignByName,
  findCreatorByName,
  findCreatorCollaboration,
  findLatestActiveCampaign,
  findOpenCampaignByName,
} from "./resolve";

const EURO_CENTS = 100;
const DRAFT_STATUSES = ["draft_submitted"] as const;
const WRITE_STATUSES = ["accepted", "changes_requested"] as const;

type Ctx = { viewer: Viewer; confirmed: boolean; locale?: "en" | "fr" };
type Handler = (intent: VoiceIntent, ctx: Ctx) => Promise<VoiceOutcome>;

const say = (speech: string, navigate?: string): VoiceOutcome => ({ speech, navigate });
const ask = (speech: string, intent: VoiceIntent): VoiceOutcome => ({ speech: `${speech} Confirm?`, pending: intent });
const failed = (error: string): VoiceOutcome => ({ speech: error, failed: true });
const roleOf = (viewer: Viewer) => (viewer.brand ? "brand" : "creator");

// Every tool goes through the same server actions the UI uses (same auth,
// same csrf, same ownership checks). The executor only translates spoken
// names into ids and decides whether to ask "confirm?" first.
export async function executeIntent(intent: VoiceIntent, ctx: Ctx): Promise<VoiceOutcome> {
  const handler = HANDLERS[intent.tool];
  if (GATED_TOOLS.includes(intent.tool) && !ctx.confirmed) return describe(intent, ctx);
  return handler(intent, ctx);
}

// First pass of a gated tool: resolve what it would do, then ask.
async function describe(intent: VoiceIntent, { viewer, locale = "en" }: Ctx): Promise<VoiceOutcome> {
  const brandOnly = intent.tool === "topUp" || intent.tool === "bookCreator";
  const creatorOnly = intent.tool === "applyToCampaign" || intent.tool === "submitDraft";
  if (brandOnly && !viewer.brand) return failed("That's a brand action. You're signed in as a creator.");
  if (creatorOnly && !viewer.creator) return failed("That's a creator action. You're signed in as a brand.");
  switch (intent.tool) {
    case "topUp":
      return ask(`Add ${formatEuros(intent.amountEuros * EURO_CENTS, locale)} to your wallet.`, intent);
    case "bookCreator": {
      const creator = await findCreatorByName(intent.name);
      if (!creator) return failed(`I couldn't find a creator called ${intent.name}.`);
      return ask(`Book ${creator.name} for ${intent.posts} ${intent.posts === 1 ? "post" : "posts"} on your latest campaign.`, intent);
    }
    case "approveDraft":
    case "requestChanges": {
      if (!viewer.brand) return failed("Only brands review drafts.");
      const collab = await findBrandCollaboration({ brandId: viewer.brand.id, creatorName: intent.creatorName, statuses: DRAFT_STATUSES });
      if (!collab) return failed(`There's no draft waiting from ${intent.creatorName}.`);
      const verb = intent.tool === "approveDraft" ? "Approve" : "Request changes on";
      return ask(`${verb} ${collab.creatorName}'s draft for ${collab.campaignName}.`, intent);
    }
    case "applyToCampaign": {
      const campaign = await findOpenCampaignByName(intent.name);
      if (!campaign) return failed(`I couldn't find an open campaign called ${intent.name}.`);
      return ask(`Apply to ${campaign.name}.`, intent);
    }
    case "submitDraft": {
      if (!viewer.creator) return failed("Only creators submit drafts.");
      const collab = await findCreatorCollaboration(viewer.creator.id, WRITE_STATUSES);
      if (!collab) return failed("None of your collaborations is waiting for a draft.");
      return ask(`Submit that draft for ${collab.campaignName}.`, intent);
    }
    default:
      return failed("That action isn't confirmable.");
  }
}

const HANDLERS: Record<VoiceIntent["tool"], Handler> = {
  unknown: async (intent) => failed(intent.tool === "unknown" ? `Sorry, I didn't get that. ${intent.reason}` : "Sorry."),

  navigate: async (intent, { viewer }) => {
    if (intent.tool !== "navigate") return failed("Bad intent.");
    const href = ROUTES[roleOf(viewer)][intent.route.toLowerCase()];
    return href ? say(`Opening ${intent.route}.`, href) : failed(`I don't know a page called ${intent.route}.`);
  },

  searchCreators: async (intent, { viewer }) => {
    if (intent.tool !== "searchCreators" || !viewer.brand) return failed("Only brands search creators.");
    const params = new URLSearchParams();
    if (intent.industry) params.set("industry", intent.industry);
    if (intent.country) params.set("country", intent.country);
    if (intent.minPriceEuros) params.set("min", String(intent.minPriceEuros));
    if (intent.maxPriceEuros) params.set("max", String(intent.maxPriceEuros));
    if (intent.query) params.set("q", intent.query);
    const parts = [intent.industry, intent.country, intent.maxPriceEuros ? `under ${intent.maxPriceEuros} euros` : null].filter(Boolean);
    return say(`Searching creators${parts.length ? ` — ${parts.join(", ")}` : ""}.`, `/brand/creators?${params}`);
  },

  openCreator: async (intent, { viewer }) => {
    if (intent.tool !== "openCreator" || !viewer.brand) return failed("Only brands browse creators.");
    const creator = await findCreatorByName(intent.name);
    if (!creator) return failed(`I couldn't find a creator called ${intent.name}.`);
    return say(`Opening ${creator.name}.`, `/brand/creators?q=${encodeURIComponent(creator.handle)}`);
  },

  openCampaign: async (intent, { viewer }) => {
    if (intent.tool !== "openCampaign") return failed("Bad intent.");
    const campaign = viewer.brand ? await findCampaignByName(viewer.brand.id, intent.name) : await findOpenCampaignByName(intent.name);
    if (!campaign) return failed(`I couldn't find a campaign called ${intent.name}.`);
    const href = viewer.brand ? `/brand/campaigns/${campaign.id}` : `/creator/opportunities?q=${encodeURIComponent(campaign.name)}`;
    return say(`Opening ${campaign.name}.`, href);
  },

  showResults: async (intent, { viewer }) => {
    if (intent.tool !== "showResults") return failed("Bad intent.");
    if (!viewer.brand) return say("Opening your analytics.", "/creator/analytics");
    if (!intent.campaign) return say("Opening results.", "/brand/results");
    const campaign = await findCampaignByName(viewer.brand.id, intent.campaign);
    if (!campaign) return failed(`I couldn't find a campaign called ${intent.campaign}.`);
    return say(`Opening results for ${campaign.name}.`, `/brand/campaigns/${campaign.id}/analytics`);
  },

  topUp: async (intent, ctx) => {
    if (intent.tool !== "topUp") return failed("Bad intent.");
    const result = await topUpWallet({ amountCents: intent.amountEuros * EURO_CENTS });
    if (!result.ok) return failed(result.error);
    return say(`Done. Your wallet is now ${formatEuros(result.data.balanceCents, ctx.locale ?? "en")}.`, "/brand/billing");
  },

  bookCreator: async (intent, { viewer }) => {
    if (intent.tool !== "bookCreator" || !viewer.brand) return failed("Only brands book creators.");
    const creator = await findCreatorByName(intent.name);
    if (!creator) return failed(`I couldn't find a creator called ${intent.name}.`);
    const campaign = await findLatestActiveCampaign(viewer.brand.id);
    if (!campaign) return failed("You don't have an active campaign to book against yet.");
    const result = await bookCreator({ campaignId: campaign.id, creatorId: creator.id, option: intent.posts > 1 ? "bundle" : "single" });
    if (!result.ok) return failed(result.error);
    return say(`Booked ${creator.name} on ${campaign.name}. The invitation is out.`, "/brand/collaborations");
  },

  approveDraft: (intent, ctx) => review(intent, ctx, "approve"),
  requestChanges: (intent, ctx) => review(intent, ctx, "request_changes"),

  applyToCampaign: async (intent, { viewer }) => {
    if (intent.tool !== "applyToCampaign" || !viewer.creator) return failed("Only creators apply.");
    const campaign = await findOpenCampaignByName(intent.name);
    if (!campaign) return failed(`I couldn't find an open campaign called ${intent.name}.`);
    const result = await applyToCampaign({ csrfToken: viewer.csrfToken, campaignId: campaign.id });
    if (!result.ok) return failed(result.error);
    return say(`Applied to ${campaign.name}.`, "/creator/collaborations");
  },

  submitDraft: async (intent, { viewer }) => {
    if (intent.tool !== "submitDraft" || !viewer.creator) return failed("Only creators submit drafts.");
    const collab = await findCreatorCollaboration(viewer.creator.id, WRITE_STATUSES);
    if (!collab) return failed("None of your collaborations is waiting for a draft.");
    const result = await submitDraft({ csrfToken: viewer.csrfToken, collaborationId: collab.id, draftText: intent.text });
    if (!result.ok) return failed(result.error);
    return say(`Draft sent for ${collab.campaignName}. The brand will review it.`, `/creator/collaborations/${collab.id}`);
  },
};

async function review(intent: VoiceIntent, { viewer }: Ctx, decision: "approve" | "request_changes"): Promise<VoiceOutcome> {
  if ((intent.tool !== "approveDraft" && intent.tool !== "requestChanges") || !viewer.brand) return failed("Only brands review drafts.");
  const collab = await findBrandCollaboration({ brandId: viewer.brand.id, creatorName: intent.creatorName, statuses: DRAFT_STATUSES });
  if (!collab) return failed(`There's no draft waiting from ${intent.creatorName}.`);
  const note = intent.tool === "requestChanges" ? intent.note : "";
  const result = await reviewDraft({ csrfToken: viewer.csrfToken, collaborationId: collab.id, decision, note });
  if (!result.ok) return failed(result.error);
  const verb = decision === "approve" ? "Approved" : "Changes requested on";
  return say(`${verb} ${collab.creatorName}'s draft.`, `/brand/collaborations/${collab.id}`);
}
