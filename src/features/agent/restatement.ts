import type { ResultEvent } from "./events";

// When a card shows the items, the reply adds only what the card doesn't. A
// list restating them (one per line, or run together on one line) is taken
// out once it names two or more of the card's items, and so is any sentence
// that names two or more of them ("Ethyl applied, Esmeralda sent a draft…").
// A single mention ("Start with Esmeralda's draft") stays. Pure.
export function cardNames(result: ResultEvent): string[] {
  switch (result.kind) {
    case "creators": return result.items.map((c) => c.name);
    case "collaborations": return result.items.map((c) => c.counterpart);
    case "opportunities": return result.items.map((o) => o.campaign);
    default: return [];
  }
}

// A list item starts a line, or follows whitespace inside a line ("… - B …");
// it ends at the end of its line.
const MARKER = /(?:^|\s)(?:[-*•+]|\d+[.)])\s+(?=\S)/g;
type Part = { text: string; item: boolean };

function parts(reply: string): Part[] {
  return reply.split("\n").flatMap((line) => {
    const pieces = line.split(MARKER);
    const startsWithItem = /^\s*(?:[-*•+]|\d+[.)])\s+\S/.test(line);
    return pieces.map((text, i) => ({ text: text.trim(), item: i > 0 || startsWithItem })).filter((p) => p.text);
  });
}

export function dropRestatement(reply: string, names: string[]): string {
  const known = names.map((n) => n.trim().toLowerCase()).filter((n) => n.length > 1);
  if (known.length === 0) return reply;
  const count = (s: string) => known.filter((n) => s.replace(/\*/g, "").toLowerCase().includes(n)).length;
  const all = parts(reply);
  const listing = all.filter((p) => p.item && count(p.text) > 0).length >= 2;
  const sentences = all
    .filter((p) => !(listing && p.item && count(p.text) > 0))
    .flatMap((p) => p.text.split(/(?<=[.!?])\s+/));
  const kept = sentences.filter((s) => count(s) < 2);
  if (!listing && kept.length === sentences.length) return reply;
  return kept.map((s) => s.replace(/\s*:\s*$/, ".")).join(" ").trim();
}
