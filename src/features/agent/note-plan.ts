import { parseBudget } from "./budget";

// Saved preferences stay one of each: a note that says the same thing again
// (whatever the case, spacing or way of writing the amount) is skipped, and a
// new budget replaces the older budget of the same kind (monthly or total)
// instead of sitting beside it. Pure.
export type Note = { id: string; text: string };
export type NotePlan = { action: "skip" } | { action: "insert"; replace: string[] };

export function noteKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[  ]/g, " ")
    .replace(/(\d)[,.](\d{3})\b/g, "$1$2")
    .replace(/(\d+(?:[.,]\d+)?)\s*k\b/g, (_, n: string) => String(Math.round(Number(n.replace(",", ".")) * 1000)))
    .replace(/\s*(?:euros?|eur)\b/g, " €")
    .replace(/€\s*(\d+)/g, "$1 €")
    .replace(/(\d+)\s*€/g, "$1 €")
    .replace(/\b(per|each|every)\s+month\b|\bmonthly\b/g, "a month")
    .replace(/[^\p{L}\p{N}€ ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function planNote(text: string, existing: Note[]): NotePlan {
  const key = noteKey(text);
  if (existing.some((n) => noteKey(n.text) === key)) return { action: "skip" };
  const budget = parseBudget(text);
  const replace = budget ? existing.filter((n) => parseBudget(n.text)?.period === budget.period).map((n) => n.id) : [];
  return { action: "insert", replace };
}

// For a one-off cleanup: the ids to delete so each note is kept once (the
// newest first in the list wins), with only the newest budget of each kind.
export function redundantNotes(newestFirst: Note[]): string[] {
  const kept: Note[] = [];
  const drop: string[] = [];
  for (const n of newestFirst) {
    const plan = planNote(n.text, kept);
    if (plan.action === "skip" || kept.some((k) => parseBudget(n.text) && parseBudget(k.text)?.period === parseBudget(n.text)?.period)) drop.push(n.id);
    else kept.push(n);
  }
  return drop;
}
