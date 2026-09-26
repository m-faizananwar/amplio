import "server-only";
import { getBrandProfile, listCampaignSummaries } from "@/features/campaigns/server/read-campaigns";
import { creatorsOnCampaign, listBrandCollaborations } from "@/features/collaborations/server/queries";
import { getMarketplaceContext, listCreators } from "@/features/marketplace/server/queries";
import { marketplaceQuerySchema } from "@/features/marketplace/schemas";
import type { CreatorDto } from "@/features/marketplace/schemas";
import { billingBucketsNow, walletCentsNow } from "@/features/payouts/server/queries";
import { filterFor } from "@/lib/next-step";
import type { CreatorCard } from "../../events";
import { describeFilters, searchLimit } from "../../filters";
import { arr, euros, num, obj, type ReadTool, str, type ToolContext } from "./types";


const brandId = (ctx: ToolContext) => ctx.viewer.brand?.id ?? "";

export function toCreatorCard(c: CreatorDto): CreatorCard {
  return { id: c.id, handle: c.handle, name: c.name, headline: c.headline, country: c.country, industries: c.industries, followers: c.followers, priceCents: c.priceCents, fitScore: c.fit.score, fitReason: c.fit.reason, avatarUrl: c.avatarUrl };
}

const getProfile: ReadTool = {
  name: "getBrandProfile", role: "brand", kind: "read", label: "Reading your brand profile",
  description: "The brand's company, website, value proposition, target industries and regions.",
  parameters: obj({}),
  async run(ctx) {
    const p = await getBrandProfile(brandId(ctx));
    if (!p) return { summary: "no profile", data: null };
    return { summary: p.company, data: p };
  },
};

const listCampaigns: ReadTool = {
  name: "listCampaigns", role: "brand", kind: "read", label: "Reading your campaigns",
  description: "The brand's campaigns with id, name and status (draft, active, completed). Only an active campaign can take bookings.",
  parameters: obj({}),
  async run(ctx) {
    const rows = await listCampaignSummaries(brandId(ctx));
    return { summary: `${rows.length} campaigns`, data: rows };
  },
};

const searchCreators: ReadTool = {
  name: "searchCreators", role: "brand", kind: "read", label: "Searching creators",
  description: "Search creators ranked by fit for one of the brand's campaigns. Filters: industries, countries (ISO codes like FR — pass them whenever the user names a country), price range in euros, minimum followers. `limit` = how many the user asked for (default 6, max 10). The output lists appliedFilters: only those were applied.",
  parameters: obj({
    campaignId: str("Campaign id to rank fit against; omit for the active campaign"),
    industries: arr("Industries, e.g. SaaS, B2B"),
    countries: arr("ISO country codes, e.g. FR, DE"),
    minPriceEuros: num("Lowest price per post in euros"),
    maxPriceEuros: num("Highest price per post in euros"),
    minFollowers: num("Minimum LinkedIn followers"),
    query: str("Free text: a name, topic or headline word"),
    limit: num("How many creators to return: the number the user asked for"),
  }),
  async run(ctx, a) {
    const mctx = await getMarketplaceContext(ctx.viewer, typeof a.campaignId === "string" ? a.campaignId : undefined);
    if (!mctx) return { summary: "no brand context", data: [] };
    const q = marketplaceQuerySchema.parse({
      campaign: mctx.selectedCampaign?.id, sort: "best", q: typeof a.query === "string" ? a.query : undefined,
      industry: Array.isArray(a.industries) ? a.industries.join(",") : undefined,
      country: Array.isArray(a.countries) ? a.countries.join(",") : undefined,
      min: typeof a.minPriceEuros === "number" ? String(Math.floor(a.minPriceEuros)) : undefined,
      max: typeof a.maxPriceEuros === "number" ? String(Math.ceil(a.maxPriceEuros)) : undefined,
    });
    const list = await listCreators(mctx, q);
    const minFollowers = typeof a.minFollowers === "number" ? a.minFollowers : 0;
    // creators already invited to or working on this campaign can't be booked
    // again; the list is cached, so the campaign's current rows are read fresh
    const onIt = mctx.selectedCampaign ? await creatorsOnCampaign(mctx.selectedCampaign.id, list.items.map((c) => c.id)) : new Set<string>();
    const isOn = (c: CreatorDto) => Boolean(c.collaborationStatus) || onIt.has(c.id);
    const already = list.items.filter(isOn).length;
    const top = list.items.filter((c) => c.followers >= minFollowers && !isOn(c)).slice(0, searchLimit(a));
    const applied = describeFilters(a);
    const cards = top.map(toCreatorCard);
    return {
      summary: `${applied.length ? `${applied.join(" · ")} → ` : "no filters → "}${list.total} match · ${cards.length} best by fit${mctx.selectedCampaign ? ` for ${mctx.selectedCampaign.name}` : ""}${already ? ` · ${already} already on it` : ""}`,
      data: { appliedFilters: applied.length ? applied : ["none"], campaign: mctx.selectedCampaign, alreadyOnCampaign: already, creators: top.map((c) => ({ id: c.id, name: c.name, country: c.country, industries: c.industries, followers: c.followers, priceCents: c.priceCents, fitScore: c.fit.score, fitReason: c.fit.reason })) },
      result: { type: "result", kind: "creators", title: mctx.selectedCampaign ? mctx.selectedCampaign.name : "Creators", items: cards },
    };
  },
};

const listCollaborations: ReadTool = {
  name: "listCollaborations", role: "brand", kind: "read", label: "Reading your collaborations",
  description: "The brand's collaborations with status and who acts next. Optional filter: needs_you, waiting, live, done.",
  parameters: obj({ filter: str("needs_you | waiting | live | done") }),
  async run(ctx, a) {
    const rows = await listBrandCollaborations(brandId(ctx));
    const f = typeof a.filter === "string" ? a.filter : null;
    const picked = rows.filter((c) => !f || filterFor(c.status, "brand") === f);
    const items = picked.map((c) => ({ id: c.id, campaign: c.campaignName, counterpart: c.creatorName, status: c.status, nextAction: filterFor(c.status, "brand"), feeCents: c.feeCents }));
    return { summary: `${items.length} collaborations`, data: items, result: { type: "result", kind: "collaborations", title: "Collaborations", items } };
  },
};

const getWallet: ReadTool = {
  name: "getWallet", role: "brand", kind: "read", label: "Checking your wallet",
  description: "The wallet balance available for new invitations and what is held for pending ones, in cents.",
  parameters: obj({}),
  async run(ctx) {
    // both fresh: the agent may quote them right after it moved money
    const buckets = await billingBucketsNow(brandId(ctx));
    const availableCents = await walletCentsNow(brandId(ctx));
    return { summary: `${euros(availableCents, ctx.locale)} available`, data: { availableCents, heldCents: buckets.heldCents }, result: { type: "result", kind: "wallet", title: "Wallet", item: { availableCents, heldCents: buckets.heldCents } } };
  },
};

export const BRAND_READS = [getProfile, listCampaigns, searchCreators, listCollaborations, getWallet];
