import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const campaign = { id: "21b12626-7a2e-4abd-a975-ae2df290a8b8", name: "Zune creator brief", status: "active" };
const picks = [
  { id: "11111111-1111-4111-a111-111111111111", name: "Randy Keebler", priceCents: 12_500 },
  { id: "22222222-2222-4222-a222-222222222222", name: "Edwardo Schulist", priceCents: 14_500 },
];
const onCampaign = vi.fn();
vi.mock("@/features/campaigns/server/read-campaigns", () => ({ getCampaign: async () => campaign, getBrandProfile: async () => ({ id: "b1" }) }));
vi.mock("@/features/campaigns/server/read-creators", () => ({ getCreatorPicks: async () => picks }));
vi.mock("@/features/collaborations/server/queries", () => ({ creatorsOnCampaign: (...a: unknown[]) => onCampaign(...a), listBrandCollaborations: async () => [] }));
vi.mock("@/features/marketplace/server/actions", () => ({ bookCreator: vi.fn() }));
vi.mock("@/features/collaborations/server/actions", () => ({ payCollaboration: vi.fn(), reviewDraft: vi.fn() }));
vi.mock("@/features/collaborations/server/messages-actions", () => ({ sendMessage: vi.fn() }));
vi.mock("@/features/payouts/server/actions", () => ({ topUpWallet: vi.fn() }));
// the balance is read fresh from the database, not from the session
vi.mock("@/features/payouts/server/queries", () => ({ walletCentsNow: async () => 500_000, bookedThisMonthCents: async () => 150_000 }));

const { BRAND_WRITES } = await import("./server/tools/brand-write");
const book = BRAND_WRITES.find((t) => t.name === "bookCreators");
const ctx = { viewer: { brand: { id: "b1", walletCents: 1 }, csrfToken: "c" }, locale: "en" } as never;
const args = { campaignId: campaign.id, creatorIds: picks.map((p) => p.id) };

describe("booking creators already on the campaign", () => {
  it("refuses up front, naming who is already on it", async () => {
    onCampaign.mockResolvedValue(new Set(picks.map((p) => p.id)));
    const out = book && book.kind === "confirm" ? await book.prepare(ctx, args) : null;
    expect(out).toEqual({ error: "Randy Keebler, Edwardo Schulist are already on Zune creator brief. Search again for others." });
  });

  it("books only the ones who aren't, and the card says who was left out", async () => {
    onCampaign.mockResolvedValue(new Set([picks[0].id]));
    const out = book && book.kind === "confirm" ? await book.prepare(ctx, args) : null;
    expect(out && "facts" in out ? out.facts : null).toEqual([
      { label: "Creators", value: "Edwardo Schulist (€145.00)" },
      { label: "Already on it", value: "Randy Keebler" },
      { label: "Held from your wallet", value: "€145.00", cents: 14_500 },
      { label: "Wallet after", value: "€4,855.00", cents: 485_500 },
    ]);
  });

  it("with a monthly budget, the card keeps the total within what's left this month", async () => {
    onCampaign.mockResolvedValue(new Set());
    const withBudget = { ...(ctx as object), budget: { cents: 200_000, period: "month" } } as never;
    const out = book && book.kind === "confirm" ? await book.prepare(withBudget, args) : null;
    // €270 on top of €1,500 already booked this month: €1,770 of €2,000
    expect(out && "facts" in out ? out.facts.find((f) => f.label === "Budget") : null).toEqual({ label: "Budget", value: "€1,770.00 of your €2,000.00 this month", cents: 177_000 });
  });

  it("over the budget it refuses, and the price per creator was never capped by it", async () => {
    onCampaign.mockResolvedValue(new Set());
    const tight = { ...(ctx as object), budget: { cents: 160_000, period: "month" } } as never;
    const out = book && book.kind === "confirm" ? await book.prepare(tight, args) : null;
    expect(out && "error" in out ? out.error : null).toBe("The fees total €270.00, and €100.00 is left of your €1,600.00 this month (€1,500.00 already booked this month).");
    // €100 left fits neither creator (€125, €145): no "book fewer" to offer
    expect(out && "error" in out ? out.nextSteps : null).toEqual([]);
  });
});
