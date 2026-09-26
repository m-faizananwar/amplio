import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// a database whose agent tables don't exist yet (prod before the migration)
vi.mock("@/db", () => ({ getDb: () => { throw new Error('relation "agent_threads" does not exist'); } }));
vi.mock("@/features/ai/server/llm", () => ({ generateText: vi.fn() }));

const { addNote, listNotes, listThreads, openThread, saveTurn } = await import("./server/memory");

describe("agent memory without its tables", () => {
  it("degrades to no memory instead of failing the turn", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(openThread("u1", null, { title: "hello" })).resolves.toBeNull();
    await expect(openThread("u1", "t1", { title: "hello" })).resolves.toBeNull();
    await expect(listNotes("u1")).resolves.toEqual([]);
    await expect(listThreads("u1")).resolves.toEqual([]);
    await expect(addNote("u1", "only French creators")).resolves.toBe(false);
    await expect(saveTurn("t1", { user: "a", assistant: "b" })).resolves.toBeUndefined();
  });
});
