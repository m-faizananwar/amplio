import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const getPending = vi.fn();
const settle = vi.fn();
const agentTurn = vi.fn();
vi.mock("./server/memory", () => ({ getPending: (t: string) => getPending(t), appendEvents: async () => undefined }));
vi.mock("./server/turn", () => ({ agentTurn: (a: unknown) => agentTurn(a) }));

const { voiceTurn } = await import("./server/voice-turn");
const viewer = { userId: "u1", brand: { id: "b1" }, creator: null, csrfToken: "c" } as never;

describe("confirming on a call", () => {
  beforeEach(() => {
    getPending.mockReset(); settle.mockReset(); agentTurn.mockReset();
    settle.mockResolvedValue([{ type: "message", id: "m", text: "Invited Randy (€125.00).", final: true }]);
    agentTurn.mockResolvedValue({ events: [{ type: "message", id: "m", text: "Here you go.", final: true }] });
  });

  it("a spoken yes runs the card pending in this thread, and says what happened", async () => {
    getPending.mockResolvedValue("pa_current");
    const said = await voiceTurn({ viewer, locale: "en", transcript: "Yes, book them", threadId: "t1", settle });
    expect(settle).toHaveBeenCalledWith("pa_current", "confirm");
    expect(agentTurn).not.toHaveBeenCalled();
    expect(said).toBe("Invited Randy (125 euros).");
  });

  it("a yes with no card pending confirms nothing and starts nothing", async () => {
    getPending.mockResolvedValue(null);
    const said = await voiceTurn({ viewer, locale: "en", transcript: "yes", threadId: "t1", settle });
    expect(settle).not.toHaveBeenCalled();
    expect(agentTurn).not.toHaveBeenCalled();
    expect(said).toMatch(/nothing's waiting/i);
  });

  it("a new request leaves the card pending", async () => {
    getPending.mockResolvedValue("pa_current");
    await voiceTurn({ viewer, locale: "en", transcript: "actually, what's in my wallet?", threadId: "t1", settle });
    expect(settle).not.toHaveBeenCalled();
    expect(agentTurn).toHaveBeenCalledWith(expect.objectContaining({ voice: true, threadId: "t1" }));
  });

  it("without a thread there is no pending card, so a yes can't confirm", async () => {
    await voiceTurn({ viewer, locale: "en", transcript: "yes", threadId: null, settle });
    expect(getPending).not.toHaveBeenCalled();
    expect(settle).not.toHaveBeenCalled();
  });
});
