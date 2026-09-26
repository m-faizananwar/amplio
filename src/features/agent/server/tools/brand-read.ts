import "server-only";
import { getCampaignAnalytics } from "@/features/campaigns/server/read-analytics";
import { getBrandProfile, getCampaign, listCampaignSummaries } from "@/features/campaigns/server/read-campaigns";
import { campaignCreatorCounts, creatorsOnCampaign, listBrandCollaborations } from "@/features/collaborations/server/queries";
import { getMarketplaceContext, listCreators } from "@/features/marketplace/server/queries";
import { marketplaceQuerySchema } from "@/features/marketplace/schemas";
import type { CreatorDto } from "@/features/marketplace/schemas";
import { billingBucketsNow, walletCentsNow } from "@/features/payouts/server/queries";
import { pickCollaborations } from "../../collab-list";
import type { CreatorCard } from "../../events";
import { describeFilters, searchLimit } from "../../filters";
import { arr, euros, L, num, obj, type ReadTool, str, type ToolContext } from "./types";


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
    // nothing matched: the ways to widen this search, only for filters it used
    const again = `Repeat the last searchCreators call (same campaign and filters)`;
    const nextSteps = top.length ? undefined : [
      ...(Array.isArray(a.countries) && a.countries.length ? [{ label: L(ctx, "Search without the country filter", "Chercher sans filtre de pays"), hint: `${again} without countries.` }] : []),
      ...(typeof a.maxPriceEuros === "number" ? [{ label: L(ctx, "Raise the budget", "Augmenter le budget"), hint: "Ask for the new maximum price per creator with askUser, then repeat the last searchCreators call with it." }] : []),
      ...(Array.isArray(a.industries) && a.industries.length ? [{ label: L(ctx, "Any industry", "Tous secteurs"), hint: `${again} without industries.` }] : []),
    ];
    const cards = top.map(toCreatorCard);
    return {
      summary: `${applied.length ? `${applied.join(" · ")} → ` : "no filters → "}${list.total} match · ${cards.length} best by fit${mctx.selectedCampaign ? ` for ${mctx.selectedCampaign.name}` : ""}${already ? ` · ${already} already on it` : ""}`,
      data: { appliedFilters: applied.length ? applied : ["none"], campaign: mctx.selectedCampaign, alreadyOnCampaign: already, creators: top.map((c) => ({ id: c.id, name: c.name, country: c.country, industries: c.industries, followers: c.followers, priceCents: c.priceCents, fitScore: c.fit.score, fitReason: c.fit.reason })) },
      result: { type: "result", kind: "creators", title: mctx.selectedCampaign ? mctx.selectedCampaign.name : "Creators", items: cards },
      nextSteps,
    };
  },
};

const listCollaborations: ReadTool = {
  name: "listCollaborations", role: "brand", kind: "read", label: "Reading your collaborations",
  description: "The brand's collaborations with status and who acts next, most recent first. Optional filter: needs_you, waiting, live, done. `limit` = how many the user asked for (default 8, max 20); the output says how many exist in total.",
  parameters: obj({ filter: str("needs_you | waiting | live | done"), limit: num("How many to return: the number the user asked for") }),
  async run(ctx, a) {
    const rows = await listBrandCollaborations(brandId(ctx));
    const { total, items } = pickCollaborations(rows, { role: "brand", filter: a.filter, limit: a.limit, counterpart: (c) => c.creatorName });
    return { summary: `${total} collaborations · ${items.length} shown`, data: { total, shown: items.length, items }, result: { type: "result", kind: "collaborations", title: "Collaborations", items } };
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

const TOP_CREATORS = 3;

const readCampaign: ReadTool = {
  name: "getCampaign", role: "brand", kind: "read", label: "Reading the campaign",
  description: "One of the brand's campaigns: status, post deadline, and, once it is active, how it is doing (published posts, qualified clicks, estimated reach, bookings, committed budget, top creators by clicks). A draft has no results yet.",
  parameters: obj({ campaignId: str("The campaign id, from listCampaigns") }, ["campaignId"]),
  async run(ctx, a) {
    const c = await getCampaign(brandId(ctx), String(a.campaignId ?? ""));
    if (!c) return { summary: "not one of yours", data: { error: "That campaign isn't one of yours." } };
    const base = { id: c.id, name: c.name, status: c.status, postDeadline: c.postDeadline, feeCents: c.defaultFeeCents };
    // creators invited / booked, counted fresh: on the card and for the reply
    const counts = await campaignCreatorCounts(c.id);
    const card = { type: "result" as const, kind: "campaign" as const, title: c.name, item: { id: c.id, name: c.name, status: c.status, postDeadline: c.postDeadline, creatorsInvited: counts.invited, creatorsBooked: counts.booked } };
    if (c.status === "draft") {
      const active = (await listCampaignSummaries(brandId(ctx))).find((x) => x.status === "active");
      const open = (section: string) => `Call openPage with campaignId ${c.id} and section "${section}" (campaign "${c.name}").`;
      const nextSteps = [
        { label: L(ctx, "Launch it", "La lancer"), hint: open("launch") },
        { label: L(ctx, "Edit the brief", "Modifier le brief"), hint: open("brief") },
        ...(active ? [{ label: L(ctx, "Show my active campaign", "Voir ma campagne active"), hint: `Call getCampaign with campaignId ${active.id} (campaign "${active.name}").` }] : []),
      ];
      return { summary: `${c.name} · draft, no results yet`, data: { ...base, creatorsInvited: counts.invited, creatorsBooked: counts.booked, results: null, note: "Draft: launch it to get results." }, result: card, nextSteps };
    }
    const r = await getCampaignAnalytics(c.id);
    const results = { publishedPosts: r.publishedPosts, qualifiedClicks: r.qualifiedClicks, estReach: r.estReach, bookings: r.bookings, committedCents: r.committedCents, topCreators: r.byCreator.slice(0, TOP_CREATORS).map((x) => ({ name: x.creatorName, clicks: x.clicks })) };
    const shown = { publishedPosts: r.publishedPosts, clicks: r.qualifiedClicks, estReach: r.estReach, bookings: r.bookings, committedCents: r.committedCents, budgetCents: r.committedCents };
    return { summary: `${c.name} · ${r.publishedPosts} posts · ${r.qualifiedClicks} clicks`, data: { ...base, creatorsInvited: counts.invited, creatorsBooked: counts.booked, results }, result: { ...card, item: { ...card.item, ...shown } } };
  },
};

export const BRAND_READS = [getProfile, listCampaigns, readCampaign, searchCreators, listCollaborations, getWallet];
