import { describe, expect, it } from "vitest";
import { agentEvent, sse } from "./events";
import { BRAND_RUN_FIXTURE, CREATOR_RUN_FIXTURE } from "./fixtures";

describe("agent events", () => {
  it("the fixtures are valid stream events", () => {
    for (const e of [...BRAND_RUN_FIXTURE, ...CREATOR_RUN_FIXTURE]) expect(agentEvent.safeParse(e).success).toBe(true);
  });

  it("encodes one SSE frame per event", () => {
    expect(sse({ type: "done", threadId: null })).toBe('data: {"type":"done","threadId":null}\n\n');
  });

  it("caps quick replies at four", () => {
    expect(agentEvent.safeParse({ type: "question", text: "?", chips: ["a", "b", "c", "d", "e"] }).success).toBe(false);
  });
});
