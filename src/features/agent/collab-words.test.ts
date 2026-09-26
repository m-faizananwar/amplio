import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// the real message files, looked up the way next-intl does
vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) => {
    const [file, ...path] = namespace.split(".");
    const tree = path.reduce((o: Record<string, unknown>, k) => o[k] as Record<string, unknown>, JSON.parse(readFileSync(`messages/${locale}/${file}.json`, "utf8")));
    return (key: string) => String(tree[key]);
  },
}));

const { withCollabWords } = await import("./server/tools/collab-words");

describe("collaborations in the model's words", () => {
  it("gives the status and who moves next in the viewer's language, beside the keys", async () => {
    const items = [{ id: "c1", status: "draft_submitted" as const, nextAction: "needs_you" as const }, { id: "c2", status: "invited" as const, nextAction: "waiting" as const }];
    expect(await withCollabWords(items, "brand", "en")).toEqual([
      { id: "c1", status: "draft_submitted", nextAction: "needs_you", statusLabel: "Draft sent", nextStep: "your move" },
      { id: "c2", status: "invited", nextAction: "waiting", statusLabel: "Invited", nextStep: "waiting on the creator" },
    ]);
    const fr = await withCollabWords(items, "creator", "fr");
    expect(fr.map((c) => [c.statusLabel, c.nextStep])).toEqual([["Brouillon envoyé", "à vous de jouer"], ["Invitation reçue", "en attente de la marque"]]);
    // a brand reads "invited" from its own side, as the cards do
    expect((await withCollabWords(items, "brand", "fr"))[1].statusLabel).toBe("Invitée");
  });
});
