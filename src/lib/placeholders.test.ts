import { describe, expect, it } from "vitest";
import { hasBracketedExample } from "./placeholders";

describe("hasBracketedExample", () => {
  it("finds a [bracketed] example left in the text", () => {
    expect(hasBracketedExample("We help [your ideal customer] ship faster")).toBe(true);
    expect(hasBracketedExample("Line one\n[replace me]")).toBe(true);
  });
  it("passes text with none", () => {
    expect(hasBracketedExample("We help founders ship faster")).toBe(false);
    expect(hasBracketedExample("")).toBe(false);
    expect(hasBracketedExample(null)).toBe(false);
    expect(hasBracketedExample("an empty [] pair")).toBe(false);
    expect(hasBracketedExample("[spans\nlines]")).toBe(false);
  });
});
