import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const getCampaign = vi.fn();
const getCampaignAnalytics = vi.fn();
const summaries = vi.fn();
vi.mock("@/features/campaigns/server/read-campaigns", () => ({ getCampaign: (b: string, c: string) => getCampaign(b, c), getBrandProfile: vi.fn(), listCampaignSummaries: () => summaries() }));
vi.mock("@/features/campaigns/server/read-analytics", () => ({ getCampaignAnalytics: (c: string) => getCampaignAnalytics(c) }));
vi.mock("@/features/collaborations/server/queries", () => ({ listBrandCollaborations: async () => [], listCreatorCollaborations: async () => [], creatorsOnCampaign: async () => new Set() }));
vi.mock("@/features/marketplace/server/queries", () => ({ getMarketplaceContext: vi.fn(), listCreators: vi.fn() }));
vi.mock("@/features/payouts/server/queries", () => ({ billingBucketsNow: vi.fn(), walletCentsNow: vi.fn() }));

const { campaignPath, openPageTool } = await import("./server/tools/open-page");
const { BRAND_READS } = await import("./server/tools/brand-read");
const ctx = { viewer: { brand: { id: "b1" } }, locale: "en" } as never;
const Q4 = "21b12626-7a2e-4abd-a975-ae2df290a8b8";

describe("next steps from a draft campaign", () => {
  beforeEach(() => { getCampaign.mockReset(); getCampaignAnalytics.mockReset(); summaries.mockReset().mockResolvedValue([]); });

  it("the launch flow, the brief editor and results are real pages", () => {
    expect(campaignPath(Q4, "launch")).toBe(`/brand/campaigns/${Q4}/launch`);
    expect(campaignPath(Q4, "brief")).toBe(`/brand/campaigns/${Q4}/brief/edit`);
    expect(campaignPath(Q4, "results")).toBe(`/brand/campaigns/${Q4}/analytics`);
    expect(campaignPath(Q4, "nonsense")).toBe(`/brand/campaigns/${Q4}`);
  });

  it("opens a campaign's launch flow only if the campaign is the brand's", async () => {
    const open = openPageTool("brand");
    getCampaign.mockResolvedValue({ id: Q4 });
    expect((await open.run(ctx, { campaignId: Q4, section: "launch" })).navigate).toBe(`/brand/campaigns/${Q4}/launch`);
    getCampaign.mockResolvedValue(null);
    expect((await open.run(ctx, { campaignId: Q4, section: "launch" })).navigate).toBeUndefined();
  });

  it("a draft reports no results instead of numbers, and says launching is the way", async () => {
    getCampaign.mockResolvedValue({ id: Q4, name: "Zune — Q4 founders push", status: "draft", postDeadline: null, defaultFeeCents: 0 });
    const read = BRAND_READS.find((t) => t.name === "getCampaign");
    const out = read && read.kind === "read" ? await read.run(ctx, { campaignId: Q4 }) : null;
    expect(out?.data).toMatchObject({ status: "draft", results: null, note: "Draft: launch it to get results." });
    expect(getCampaignAnalytics).not.toHaveBeenCalled();
  });

  it("names next steps it can actually do; the active campaign only if there is one", async () => {
    getCampaign.mockResolvedValue({ id: Q4, name: "Zune — Q4 founders push", status: "draft", postDeadline: null, defaultFeeCents: 0 });
    const read = BRAND_READS.find((t) => t.name === "getCampaign");
    summaries.mockResolvedValue([{ id: "a", name: "Zune creator brief", status: "active" }]);
    const withActive = read && read.kind === "read" ? await read.run(ctx, { campaignId: Q4 }) : null;
    expect(withActive?.nextSteps?.map((n) => n.label)).toEqual(["Launch it", "Edit the brief", "Show my active campaign"]);
    // each chip says exactly what it does, on which campaign
    expect(withActive?.nextSteps?.[0].hint).toBe(`Call openPage with campaignId ${Q4} and section "launch" (campaign "Zune — Q4 founders push").`);
    expect(withActive?.nextSteps?.[2].hint).toBe('Call getCampaign with campaignId a (campaign "Zune creator brief").');
    summaries.mockResolvedValue([{ id: Q4, name: "Q4", status: "draft" }]);
    const onlyDraft = read && read.kind === "read" ? await read.run(ctx, { campaignId: Q4 }) : null;
    expect(onlyDraft?.nextSteps?.map((n) => n.label)).toEqual(["Launch it", "Edit the brief"]);
  });
});
