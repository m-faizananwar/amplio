import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai-provider", () => ({ resolveAiProvider: () => ({ name: "gemini", apiKey: "test", envName: "GEMINI_API_KEY" }) }));
vi.mock("@/features/assistant/server/answer", () => ({ answerChat: vi.fn() }));

// Gemini, scripted: first it calls listCollaborations, then it answers by
// re-listing every row of the card it was just shown.
const replies = [
  { functionCalls: [{ name: "listCollaborations", args: { filter: "needs_you" } }], candidates: [{ content: { parts: [] } }], text: "" },
  { functionCalls: [], candidates: [{ content: { parts: [] } }], text: "Four need you this week: - Ethyl Kertzmann for Zune creator brief has status Applied. - Esmeralda Bergnaum sent a draft. - Tom Bechtelar is live. - Althea Altenwerth is live." },
];
vi.mock("@google/genai", () => ({ GoogleGenAI: class { models = { generateContent: async () => replies.shift() }; } }));

const card = { type: "result", kind: "collaborations", title: "Collaborations", items: ["Ethyl Kertzmann", "Esmeralda Bergnaum", "Tom Bechtelar", "Althea Altenwerth"].map((n, i) => ({ id: `c${i}`, campaign: "Zune creator brief", counterpart: n, status: "applied", nextAction: "needs_you", feeCents: 1000 })) };
vi.mock("./server/tools", () => ({
  declarationsFor: () => [],
  findTool: () => ({ name: "listCollaborations", kind: "read", label: "Reading your collaborations", run: async () => ({ summary: "4 collaborations", data: { total: 4 }, result: card }) }),
}));

const { runTurn } = await import("./server/loop");

describe("a turn that shows a card", () => {
  it("replies without restating the card's rows", async () => {
    const events: Array<{ type: string; text?: string; final?: boolean }> = [];
    const viewer = { userId: "u1", brand: { id: "b1" }, creator: null, csrfToken: "c", firstName: "D", lastName: "B" } as never;
    await runTurn({ viewer, locale: "en", text: "Which collaborations need my attention this week?", history: [], emit: (e) => events.push(e) });
    expect(events.some((e) => e.type === "result")).toBe(true);
    const said = events.filter((e) => e.type === "message" && e.final).map((e) => e.text).join(" ");
    expect(said).toBe("Four need you this week.");
    expect(said).not.toMatch(/Kertzmann|Bergnaum|Bechtelar|Altenwerth/);
  });
});
