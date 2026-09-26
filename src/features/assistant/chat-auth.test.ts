import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const getViewer = vi.fn();
const answerChat = vi.fn();
vi.mock("@/features/auth/server/session", () => ({ getViewer: () => getViewer() }));
vi.mock("@/features/assistant/server/answer", () => ({ answerChat: (req: unknown, viewer: unknown) => answerChat(req, viewer) }));

const { POST } = await import("@/app/api/assistant/chat/route");
const signedIn = { userId: "u1", csrfToken: "right", brand: { id: "b1" }, creator: null };
const ask = (headers: Record<string, string> = {}) =>
  POST(new Request("https://x.test/api/assistant/chat", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify({ message: "hi" }) }));

describe("the assistant chat on a signed-in visitor's public page", () => {
  beforeEach(() => {
    getViewer.mockReset().mockResolvedValue(signedIn);
    answerChat.mockReset().mockResolvedValue({ ok: true, text: "Hello!", source: "template" });
  });

  it("no token sent: answered as logged out, not 'session is stale'", async () => {
    const res = await ask();
    expect(res.status).toBe(200);
    expect(answerChat).toHaveBeenCalledWith(expect.anything(), null);
  });

  it("a wrong token is refused", async () => {
    const res = await ask({ "x-csrf-token": "wrong" });
    expect(res.status).toBe(403);
    expect(answerChat).not.toHaveBeenCalled();
  });

  it("the right token acts as the user (tools)", async () => {
    const res = await ask({ "x-csrf-token": "right" });
    expect(res.status).toBe(200);
    expect(answerChat).toHaveBeenCalledWith(expect.anything(), signedIn);
  });
});
