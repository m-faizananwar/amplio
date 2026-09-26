import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/campaigns/server/read-campaigns", () => ({ listCampaignSummaries: async () => [] }));
vi.mock("@/features/collaborations/server/queries", () => ({ listBrandCollaborations: async () => [], listCreatorCollaborations: async () => [] }));
vi.mock("@/features/collaborations/server/opportunities-queries", () => ({ listOpportunities: async () => [] }));
vi.mock("@/features/payouts/server/queries", () => ({ getEarningsSummary: async () => ({}) }));

const { viewerContext } = await import("./server/context");
const brand = { firstName: "Demo", lastName: "Brand", role: "brand", brand: { id: "b1", company: "Zune", walletCents: 355_000 }, creator: null } as never;
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("the assistant's workspace context", () => {
  it("writes amounts in the reader's locale, which the model repeats", async () => {
    expect(await viewerContext(brand, "en")).toContain("Wallet balance €3,550.00.");
    expect(plain(await viewerContext(brand, "fr"))).toContain("Wallet balance 3 550,00 €.");
    expect(await viewerContext(brand, "en")).not.toContain("3.550,00");
  });
});
