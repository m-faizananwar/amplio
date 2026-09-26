import { describe, expect, it } from "vitest";
import { blocksOf, runsOf } from "./messageBlocks";

describe("blocksOf", () => {
  it("turns '- ' lines into one list and the rest into paragraphs", () => {
    expect(blocksOf("Two fit your brief:\n- **Randy** · €125\n- **Toy** · €270\nWant me to book them?")).toEqual([
      { kind: "p", text: "Two fit your brief:" },
      { kind: "ul", items: ["**Randy** · €125", "**Toy** · €270"] },
      { kind: "p", text: "Want me to book them?" },
    ]);
  });
  it("keeps a plain reply as one paragraph and splits on blank lines", () => {
    expect(blocksOf("It's ready.\nConfirm and I'll do it.")).toEqual([{ kind: "p", text: "It's ready. Confirm and I'll do it." }]);
    expect(blocksOf("One.\n\nTwo.")).toEqual([{ kind: "p", text: "One." }, { kind: "p", text: "Two." }]);
  });
});

describe("runsOf", () => {
  it("marks **bold** runs and leaves stray asterisks alone", () => {
    expect(runsOf("Book **Randy Keebler** now")).toEqual([{ bold: false, text: "Book " }, { bold: true, text: "Randy Keebler" }, { bold: false, text: " now" }]);
    expect(runsOf("5 * 3")).toEqual([{ bold: false, text: "5 * 3" }]);
  });
});
