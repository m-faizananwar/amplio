import { describe, expect, it } from "vitest";
import { callTitle, historyItems, listItem } from "./thread-view";

const at = (s: string) => new Date(`2026-09-27T10:${s}Z`);

describe("the thread list", () => {
  it("hides threads nobody said anything in", () => {
    expect(listItem({ id: "t1", title: "Call", kind: "call", createdAt: at("00:00"), updatedAt: at("00:00"), turns: 0, lastAt: null })).toBeNull();
  });

  it("lists a call with its kind, turns, last activity and duration", () => {
    expect(listItem({ id: "t2", title: "Call · find 2 creators", kind: "call", createdAt: at("00:00"), updatedAt: at("00:00"), turns: 3, lastAt: at("02:30") })).toEqual({
      id: "t2", title: "Call · find 2 creators", kind: "call", turns: 3, updatedAt: "2026-09-27T10:02:30.000Z", durationSec: 150,
    });
  });

  it("a chat has no duration, and an unknown kind is a chat", () => {
    expect(listItem({ id: "t3", title: "find creators", kind: null, createdAt: at("00:00"), updatedAt: at("00:00"), turns: 1, lastAt: at("00:10") })).toEqual({
      id: "t3", title: "find creators", kind: "chat", turns: 1, updatedAt: "2026-09-27T10:00:10.000Z",
    });
  });

  it("titles a call from what was first asked", () => {
    expect(callTitle("find me 2 creators in France", "en")).toBe("Call · find me 2 creators in France");
    expect(callTitle("trouve-moi des créateurs", "fr")).toBe("Appel · trouve-moi des créateurs");
  });
});

describe("replaying a thread", () => {
  it("returns the turns in order from the log, never the title, without stream-only events", () => {
    const events = [
      { seq: 3, event: { type: "result", kind: "wallet", title: "Wallet", item: { availableCents: 1, heldCents: 0 } } as const },
      { seq: 1, event: { type: "user", text: "what's in my wallet?" } as const },
      { seq: 2, event: { type: "step", id: "s1", label: "Checking your wallet", status: "done", tool: "getWallet" } as const },
      { seq: 4, event: { type: "navigate", href: "/brand/billing" } as const },
      { seq: 5, event: { type: "message", id: "m", text: "You have €0.01.", final: true } as const },
    ];
    expect(historyItems(events, [{ role: "user", text: "ignored" }]).map((e) => e.type)).toEqual(["user", "step", "result", "message"]);
  });

  it("a step logged running then done replays once, done, in its place", () => {
    const step = (status: "running" | "done") => ({ type: "step", id: "s1", label: "Searching creators", status, tool: "searchCreators" }) as const;
    const items = historyItems([
      { seq: 1, event: { type: "user", text: "find creators" } },
      { seq: 2, event: step("running") },
      { seq: 3, event: { type: "step", id: "s2", label: "Checking your wallet", status: "done", tool: "getWallet" } },
      { seq: 4, event: step("done") },
      { seq: 5, event: { type: "user", text: "again" } },
      { seq: 6, event: step("running") },
    ], []);
    expect(items.map((e) => (e.type === "step" ? `${e.id}:${e.status}` : e.type))).toEqual(["user", "s1:done", "s2:done", "user", "s1:running"]);
  });

  it("threads from before the log replay from their messages", () => {
    expect(historyItems([], [{ role: "user", text: "hi" }, { role: "assistant", text: "Hello." }])).toEqual([
      { type: "user", text: "hi" }, { type: "message", id: "h1", text: "Hello.", final: true },
    ]);
  });
});
