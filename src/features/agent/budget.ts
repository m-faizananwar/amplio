import { formatEuros } from "@/lib/money";

// A budget the user stated ("budget €2k a month", "2 000 € au total") is a
// spend ceiling, never a per-creator price. This reads it from what the user
// said or saved; a price cap is only a price cap when they say per creator or
// per post. Pure.
export type Budget = { cents: number; period: "month" | "total" };

const CENTS = 100;
const THOUSAND = 1000;
const AMOUNT = /(?:€\s?(\d[\d\s.,  ]*)(k)?|(\d[\d\s.,  ]*)(k)?\s?(?:€|euros?\b|eur\b))/i;
const MONTH = /\b(a|per|each|every|this)\s+month\b|\bmonthly\b|\bmois\b|\bmensuel/i;
const BUDGET = /\bbudget\b/i;
const PER_CREATOR = /\b(per|each|a|par|chaque)\s+(creator|post|créateur|créatrice|publication|influenceur|influencer)s?\b/i;

function amountCents(text: string): number | null {
  const m = AMOUNT.exec(text);
  if (!m) return null;
  const raw = (m[1] ?? m[3] ?? "").replace(/[\s  ]/g, "");
  const k = Boolean(m[2] ?? m[4]);
  // "2,000" / "2.000" are thousands; "2,5" / "2.5" are decimals
  const n = /^\d{1,3}([.,]\d{3})+$/.test(raw) ? Number(raw.replace(/[.,]/g, "")) : Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * (k ? THOUSAND : 1) * CENTS);
}

export function parseBudget(text: string): Budget | null {
  if (!BUDGET.test(text)) return null;
  const cents = amountCents(text);
  return cents === null ? null : { cents, period: MONTH.test(text) ? "month" : "total" };
}

// The latest statement wins: the message, else the newest saved note.
export function budgetFrom(message: string, notes: string[]): Budget | null {
  return parseBudget(message) ?? notes.map(parseBudget).find((b): b is Budget => b !== null) ?? null;
}

export const saysPerCreator = (text: string) => PER_CREATOR.test(text);

// With a budget known, a price cap the user didn't ask for (the budget itself,
// or the budget split across creators) isn't a price cap: it stays only if
// the user said per creator / per post, or named that price themselves.
export function isBudgetAsPriceCap(maxPriceEuros: unknown, budget: Budget | null, message: string): boolean {
  if (typeof maxPriceEuros !== "number" || budget === null || saysPerCreator(message)) return false;
  const named = [...message.matchAll(new RegExp(AMOUNT.source, "gi"))].map((m) => amountCents(m[0]));
  const asked = named.some((c) => c === Math.round(maxPriceEuros * CENTS) && c !== budget.cents);
  return !asked;
}

// A booking against the budget: within it, the card says where it leaves you
// ("€1,240 of your €2,000 this month"); over it, it is refused with what's left.
type Check = { budget: Budget; spentCents: number; totalCents: number; locale: "en" | "fr" };
export function budgetCheck({ budget, spentCents, totalCents, locale }: Check): { ok: true; fact: { label: string; value: string; cents: number } } | { ok: false; error: string; leftCents: number } {
  const fr = locale === "fr";
  const e = (c: number) => formatEuros(c, locale);
  const monthly = budget.period === "month";
  const spent = monthly ? spentCents : 0;
  const left = Math.max(0, budget.cents - spent);
  const of = monthly ? (fr ? `de votre budget de ${e(budget.cents)} ce mois-ci` : `of your ${e(budget.cents)} this month`) : fr ? `de votre budget de ${e(budget.cents)}` : `of your ${e(budget.cents)} budget`;
  if (totalCents > left) {
    const already = monthly && spent > 0 ? (fr ? ` (${e(spent)} déjà engagés ce mois-ci)` : ` (${e(spent)} already booked this month)`) : "";
    return { ok: false, leftCents: left, error: fr ? `Les rémunérations font ${e(totalCents)} et il reste ${e(left)} ${of}${already}.` : `The fees total ${e(totalCents)}, and ${e(left)} is left ${of}${already}.` };
  }
  return { ok: true, fact: { label: "Budget", value: `${e(spent + totalCents)} ${of}`, cents: spent + totalCents } };
}
