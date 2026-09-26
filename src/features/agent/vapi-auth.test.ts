import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const viewerFromToken = vi.fn();
const voiceTurn = vi.fn();
vi.mock("@/features/auth/server/session", () => ({ viewerFromToken: (t: string) => viewerFromToken(t) }));
vi.mock("@/features/agent/server/voice-turn", () => ({ voiceTurn: (a: unknown) => voiceTurn(a) }));
vi.mock("@/features/agent/server/flag", () => ({ agentEnabled: () => true }));
vi.mock("@/features/agent/server/rate-limit", () => ({ allowTurn: () => true }));
process.env.VAPI_SERVER_SECRET = "s3cret";

const { POST } = await import("@/app/api/voice/vapi/route");
const { callThreadId } = await import("./call-thread");

const brand = { userId: "u-brand", brand: { id: "b1" }, creator: null, csrfToken: "c" };
const body = (args: Record<string, unknown>, vars: Record<string, unknown>) => ({
  message: { type: "tool-calls", call: { id: "call-1", assistantOverrides: { variableValues: vars } }, toolCallList: [{ id: "tc1", function: { name: "command", arguments: args } }] },
});
const post = (payload: unknown, secret = "s3cret") => POST(new Request("https://x.test/api/voice/vapi", { method: "POST", headers: { "x-vapi-secret": secret, "content-type": "application/json" }, body: JSON.stringify(payload) }));

describe("the Vapi webhook's auth", () => {
  beforeEach(() => { viewerFromToken.mockReset(); voiceTurn.mockReset(); voiceTurn.mockResolvedValue("Done."); });

  it("refuses a request without the shared secret", async () => {
    const res = await post(body({ transcript: "find creators" }, { voiceToken: "t" }), "wrong");
    expect(res.status).toBe(403);
    expect(voiceTurn).not.toHaveBeenCalled();
  });

  it("an expired or forged voice token runs nothing", async () => {
    viewerFromToken.mockResolvedValue(null);
    const res = await post(body({ transcript: "book them" }, { voiceToken: "forged" }));
    expect((await res.json()).results[0].result).toMatch(/expired/i);
    expect(voiceTurn).not.toHaveBeenCalled();
  });

  it("the viewer comes from the token on every request, never from what the model sends", async () => {
    viewerFromToken.mockResolvedValue(brand);
    await post(body({ transcript: "find creators", userId: "someone-else", viewer: "admin" }, { voiceToken: "good", locale: "fr" }));
    expect(viewerFromToken).toHaveBeenCalledWith("good");
    expect(voiceTurn).toHaveBeenCalledWith(expect.objectContaining({ viewer: brand, locale: "fr", transcript: "find creators" }));
  });

  it("every utterance of one call lands in the same thread", () => {
    expect(callThreadId(undefined, "call-1")).toBe(callThreadId(null, "call-1"));
    expect(callThreadId(undefined, "call-1")).not.toBe(callThreadId(undefined, "call-2"));
    expect(callThreadId("0F8FAD5B-D9CB-469F-A165-70867728950E", "call-1")).toBe("0f8fad5b-d9cb-469f-a165-70867728950e");
    expect(callThreadId("not-a-uuid", "call-1")).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
