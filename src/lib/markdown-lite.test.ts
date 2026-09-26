import { describe, expect, it } from "vitest";
import { isSafeHref, parseBlocks, parseInline, plainText } from "./markdown-lite";

describe("parseBlocks", () => {
  it("splits a one-line '* ' list after a colon into a lead and items", () => {
    expect(parseBlocks("You have two collaborations that need your attention this week: * **Zune creator brief** by Zune: draft ready * **Q4 push** by Zune: live")).toEqual([
      { kind: "p", lines: ["You have two collaborations that need your attention this week:"] },
      { kind: "ul", items: ["**Zune creator brief** by Zune: draft ready", "**Q4 push** by Zune: live"] },
    ]);
  });
  it("reads '- ', '* ' and '•' lines as one list, and '1.' lines as a numbered one", () => {
    expect(parseBlocks("Two fit:\n- A\n* B\n• C")).toEqual([{ kind: "p", lines: ["Two fit:"] }, { kind: "ul", items: ["A", "B", "C"] }]);
    expect(parseBlocks("Steps:\n1. Launch\n2) Invite")).toEqual([{ kind: "p", lines: ["Steps:"] }, { kind: "ol", start: 1, items: ["Launch", "Invite"] }]);
  });
  it("keeps line breaks inside a paragraph and splits on blank lines", () => {
    expect(parseBlocks("One\nTwo\n\nThree")).toEqual([{ kind: "p", lines: ["One", "Two"] }, { kind: "p", lines: ["Three"] }]);
  });
  it("leaves arithmetic alone and drops a trailing marker still streaming", () => {
    expect(parseBlocks("5 * 3 is 15")).toEqual([{ kind: "p", lines: ["5 * 3 is 15"] }]);
    expect(parseBlocks("These need you: * **A** now *")).toEqual([{ kind: "p", lines: ["These need you: * **A** now *"] }]);
    expect(parseBlocks("These need you: * **A** now * **B")).toEqual([{ kind: "p", lines: ["These need you:"] }, { kind: "ul", items: ["**A** now", "**B"] }]);
  });
});

describe("parseInline", () => {
  it("reads bold, italic, code and nesting", () => {
    expect(parseInline("Book **Randy *today* ** or `later`")).toEqual([
      { type: "text", text: "Book " },
      { type: "strong", children: [{ type: "text", text: "Randy " }, { type: "em", children: [{ type: "text", text: "today" }] }, { type: "text", text: " " }] },
      { type: "text", text: " or " },
      { type: "code", text: "later" },
    ]);
    expect(parseInline("_quietly_ done")).toEqual([{ type: "em", children: [{ type: "text", text: "quietly" }] }, { type: "text", text: " done" }]);
  });
  it("never shows a half-streamed marker", () => {
    expect(parseInline("Your brief **Zune cre")).toEqual([{ type: "text", text: "Your brief Zune cre" }]);
    expect(parseInline("see `cod")).toEqual([{ type: "text", text: "see cod" }]);
    expect(parseInline("an *ital")).toEqual([{ type: "text", text: "an ital" }]);
  });
  it("keeps snake_case, a lone asterisk and raw HTML as text", () => {
    expect(parseInline("my_var and 5 * 3 <b>x</b>")).toEqual([{ type: "text", text: "my_var and 5 * 3 <b>x</b>" }]);
  });
  it("links only to this app's own paths", () => {
    expect(parseInline("[Open it](/brand/campaigns/abc)")).toEqual([{ type: "link", href: "/brand/campaigns/abc", children: [{ type: "text", text: "Open it" }] }]);
    expect(parseInline("[evil](https://x.io)")).toEqual([{ type: "text", text: "evil" }]);
    expect(parseInline("[js](javascript:alert(1))")).toEqual([{ type: "text", text: "js)" }]);
    expect(isSafeHref("//evil.io")).toBe(false);
    expect(isSafeHref("/brand/../api")).toBe(false);
  });
});

describe("plainText", () => {
  it("gives the words alone for captions", () => {
    expect(plainText("Two need you: * **A** now * *B* later")).toBe("Two need you: A now · B later");
  });
});
