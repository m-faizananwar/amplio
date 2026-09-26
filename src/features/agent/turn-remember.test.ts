import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai-provider", () => ({ resolveAiProvider: () => ({ name: "gemini", apiKey: "test", envName: "GEMINI_API_KEY" }) }));
vi.mock("@/features/assistant/server/answer", () => ({ answerChat: vi.fn() }));
const script = [
  { functionCalls: [{ name: "rememberPreference", args: { note: "budget €3k a month" } }], candidates: [{ content: { parts: [] } }], text: "" },
  { functionCalls: [], candidates: [{ content: { parts: [] } }], text: "" },
];
vi.mock("@google/genai", () => ({ GoogleGenAI: class { models = { generateContent: async () => script.shift() }; } }));
vi.mock("./server/tools", () => ({ declarationsFor: () => [], findTool: () => ({ name: "rememberPreference", kind: "read", label: "Remembering that", run: async () => ({ summary: "budget €3k a month", data: { saved: true } }) }) }));

const { runTurn } = await import("./server/loop");

describe("a turn that only saves a preference", () => {
  it("acknowledges it instead of 'Here's what I found'", async () => {
    const events: Array<{ type: string; text?: string; final?: boolean }> = [];
    const viewer = { userId: "u1", brand: { id: "b1" }, creator: null, csrfToken: "c", firstName: "D", lastName: "B" } as never;
    await runTurn({ viewer, locale: "en", text: "our budget is now €3k a month", history: [], emit: (e) => events.push(e) });
    expect(events.filter((e) => e.type === "message" && e.final).map((e) => e.text).join(" ")).toBe("Got it, I'll remember that.");
  });
});
