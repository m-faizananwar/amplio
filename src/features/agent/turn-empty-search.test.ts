import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai-provider", () => ({ resolveAiProvider: () => ({ name: "gemini", apiKey: "test", envName: "GEMINI_API_KEY" }) }));
vi.mock("@/features/assistant/server/answer", () => ({ answerChat: vi.fn() }));
const script: unknown[] = [];
vi.mock("@google/genai", () => ({ GoogleGenAI: class { models = { generateContent: async () => script.shift() }; } }));

const empty = { summary: "0 shown", data: {}, result: { type: "result", kind: "creators", title: "Q4", items: [] }, blocker: "5 match, but all are already on this campaign.", nextSteps: [{ label: "Search without the country filter", hint: "repeat without countries" }, { label: "Any industry", hint: "repeat without industries" }] };
const found = { summary: "2 shown", data: {}, result: { type: "result", kind: "creators", title: "Q4", items: [] } };
const outcomes: unknown[] = [];
vi.mock("./server/tools", () => ({ declarationsFor: () => [], findTool: () => ({ name: "searchCreators", kind: "read", label: "Searching creators", run: async () => outcomes.shift() }) }));

const { runTurn } = await import("./server/loop");
const call = (args = {}) => ({ functionCalls: [{ name: "searchCreators", args }], candidates: [{ content: { parts: [] } }], text: "" });
const answer = (text: string) => ({ functionCalls: [], candidates: [{ content: { parts: [] } }], text });
const viewer = { userId: "u1", brand: { id: "b1" }, creator: null, csrfToken: "c", firstName: "D", lastName: "B" } as never;
const run = async () => {
  const events: Array<{ type: string; text?: string; final?: boolean; chips?: string[] }> = [];
  await runTurn({ viewer, locale: "en", text: "find 3 French SaaS creators", history: [], emit: (e) => events.push(e) });
  return { said: events.filter((e) => e.type === "message" && e.final).map((e) => e.text).join(" "), question: events.find((e) => e.type === "question") };
};

describe("a turn whose search comes back empty", () => {
  beforeEach(() => { script.length = 0; outcomes.length = 0; });

  it("says why in one sentence and leaves the options to the chips", async () => {
    script.push(call({ countries: ["FR"] }), answer("Would you like to try a different campaign, a higher budget, or different filters?"));
    outcomes.push(empty);
    const { said, question } = await run();
    expect(said).toBe("5 match, but all are already on this campaign. Want to widen it?");
    expect(question).toMatchObject({ text: "", chips: ["Search without the country filter", "Any industry"] });
  });

  it("a widened search that finds people clears the earlier blocker", async () => {
    script.push(call({ countries: ["FR"] }), call({}), answer("I found two outside France."));
    outcomes.push(empty, found);
    const { said, question } = await run();
    expect(said).toBe("I found two outside France.");
    expect(question).toBeUndefined();
  });
});
