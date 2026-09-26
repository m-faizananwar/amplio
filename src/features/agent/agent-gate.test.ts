import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const topUpWallet = vi.fn();
vi.mock("@/features/payouts/server/actions", () => ({ topUpWallet: (...a: unknown[]) => topUpWallet(...a), withdrawEarnings: vi.fn() }));

const { toolsFor, findTool } = await import("./server/tools");
const { runCall } = await import("./server/loop");
const { claimPending, createPending, readPending, PENDING_TTL_MS } = await import("./server/pending");

type V = Parameters<typeof runCall>[0]["ctx"]["viewer"];
const brand = { userId: "u-brand", email: "b@x.test", firstName: "B", lastName: "R", role: "brand", csrfToken: "csrf-b", brand: { id: "brand-1", slug: "b", company: "Zune", walletCents: 500_000, onboarded: true }, creator: null } as unknown as V;
const creator = { userId: "u-creator", email: "c@x.test", firstName: "C", lastName: "R", role: "creator", csrfToken: "csrf-c", brand: null, creator: { id: "creator-1", handle: "c", avatarUrl: "", headline: "", availableCents: 0, onboarded: true } } as unknown as V;

describe("tool authorization", () => {
  it("each role sees only its own tools", () => {
    const brandNames = toolsFor("brand").map((t) => t.name);
    const creatorNames = toolsFor("creator").map((t) => t.name);
    expect(brandNames).toEqual(expect.arrayContaining(["searchCreators", "bookCreators", "releasePayment", "topUp"]));
    expect(creatorNames).toEqual(expect.arrayContaining(["listOpportunities", "applyToCampaign", "acceptInvitation", "submitDraft"]));
    for (const n of ["bookCreators", "releasePayment", "topUp", "approveDraft"]) expect(findTool("creator", n)).toBeNull();
    for (const n of ["applyToCampaign", "acceptInvitation", "submitDraft", "getEarnings"]) expect(findTool("brand", n)).toBeNull();
  });

  it("every money or collaboration change is a confirm tool", () => {
    const changes = ["bookCreators", "approveDraft", "requestChanges", "releasePayment", "topUp", "sendMessage", "applyToCampaign", "acceptInvitation", "declineInvitation", "submitDraft"];
    for (const role of ["brand", "creator"] as const) for (const t of toolsFor(role)) if (changes.includes(t.name)) expect(t.kind).toBe("confirm");
  });

  it("a creator asking for a brand tool gets an error and nothing runs", async () => {
    const events: unknown[] = [];
    const out = await runCall({ call: { name: "topUp", args: { amountEuros: 1000 } }, ctx: { viewer: creator, locale: "en" }, emit: (e) => events.push(e), stepId: "s1" });
    expect(out.response).toMatchObject({ error: expect.stringMatching(/no tool/i) });
    expect(events).toEqual([]);
  });
});

describe("the confirm gate", () => {
  beforeEach(() => topUpWallet.mockReset());

  it("a confirm tool in the loop only prepares: a confirm card, never the action", async () => {
    const events: Array<{ type: string }> = [];
    const out = await runCall({ call: { name: "topUp", args: { amountEuros: 1000 } }, ctx: { viewer: brand, locale: "en" }, emit: (e) => events.push(e), stepId: "s1" });
    expect(out.stop).toBe("confirm");
    expect(events.map((e) => e.type)).toContain("confirm");
    expect(topUpWallet).not.toHaveBeenCalled();
  });

  it("a pending action reads back only for its user and session, before it expires", () => {
    const now = Date.now();
    const { id } = createPending({ tool: "topUp", args: { amountEuros: 1000 }, userId: "u-brand" }, "csrf-b", now);
    expect(readPending(id, { userId: "u-brand", session: "csrf-b" }, now)).toMatchObject({ ok: true, action: { tool: "topUp" } });
    expect(readPending(id, { userId: "u-other", session: "csrf-b" }, now)).toEqual({ ok: false, reason: "user" });
    expect(readPending(id, { userId: "u-brand", session: "csrf-other" }, now)).toEqual({ ok: false, reason: "signature" });
    expect(readPending(id, { userId: "u-brand", session: "csrf-b" }, now + PENDING_TTL_MS + 1)).toEqual({ ok: false, reason: "expired" });
  });

  it("a tampered pending action is refused", () => {
    const { id } = createPending({ tool: "topUp", args: { amountEuros: 1000 }, userId: "u-brand" }, "csrf-b");
    const [, mac] = id.split(".");
    const forged = `${Buffer.from(JSON.stringify({ tool: "topUp", args: { amountEuros: 99999 }, userId: "u-brand", exp: Date.now() + 1e6 })).toString("base64url")}.${mac}`;
    expect(readPending(forged, { userId: "u-brand", session: "csrf-b" })).toEqual({ ok: false, reason: "signature" });
  });

  it("a confirmation can be used once", () => {
    const { id } = createPending({ tool: "topUp", args: { amountEuros: 1000 }, userId: "u-brand" }, "csrf-b");
    const exp = Date.now() + PENDING_TTL_MS;
    expect(claimPending(id, exp)).toBe(true);
    expect(claimPending(id, exp)).toBe(false);
  });
});
