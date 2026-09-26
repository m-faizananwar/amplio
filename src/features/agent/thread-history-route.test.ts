import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const threadHistory = vi.fn();
vi.mock("@/features/agent/server/flag", () => ({ agentEnabled: () => true }));
vi.mock("@/features/agent/server/memory", () => ({ threadHistory: (u: string, t: string) => threadHistory(u, t) }));
vi.mock("@/features/auth/server/session", () => ({ getViewer: async () => ({ userId: "u1" }) }));

const { GET } = await import("@/app/api/agent/threads/[threadId]/route");
const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
const get = (threadId: string) => GET(new Request(`https://x.test/api/agent/threads/${threadId}`), { params: Promise.resolve({ threadId }) });

describe("GET /api/agent/threads/{id}", () => {
  beforeEach(() => threadHistory.mockReset());

  it("replays the owner's thread in order", async () => {
    const items = [{ type: "user", text: "find 2 creators in France" }, { type: "step", id: "s1", label: "Searching creators", status: "done", tool: "searchCreators" }];
    threadHistory.mockResolvedValue({ thread: { id, title: "Call · find 2 creators in France", kind: "call", turns: 1, updatedAt: "x", durationSec: 42 }, pending: null, items });
    const res = await get(id);
    expect(res.status).toBe(200);
    expect(threadHistory).toHaveBeenCalledWith("u1", id);
    expect((await res.json()).items).toEqual(items);
  });

  it("someone else's thread, or a malformed id, is a 404", async () => {
    threadHistory.mockResolvedValue(null);
    expect((await get(id)).status).toBe(404);
    expect((await get("not-an-id")).status).toBe(404);
  });
});
