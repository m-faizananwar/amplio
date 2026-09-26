import { formatEuros } from "@/lib/money";

// Every amount the agent says must come from a tool. This finds the money
// figures in a reply (€65, €1,050.00, 65,00 €, 4 685 €), drops any sentence
// whose figure isn't one of the amounts the tools returned this turn, and
// writes the ones it keeps in the reader's format (€3,550.00 / 3 550,00 €).
// Pure.
const CENTS = 100;
const MONEY = /(€\s?\d[\d\s.,  ]*\d|€\s?\d|\d[\d\s.,  ]*\s?€)/g;

// "1,050.00" / "1 050,00" / "65" → 1050 / 1050 / 65
export function parseEuros(raw: string): number | null {
  const digits = raw.replace(/[€\s  ]/g, "");
  const m = digits.match(/^(\d{1,3}(?:[.,]\d{3})*|\d+)(?:[.,](\d{1,2}))?$/);
  if (!m) return null;
  const whole = Number(m[1].replace(/[.,]/g, ""));
  return m[2] ? whole + Number(m[2].padEnd(2, "0")) / CENTS : whole;
}

// All euro amounts anywhere in tool output: any numeric field named …Cents.
export function amountsFrom(data: unknown, into = new Set<number>()): Set<number> {
  if (Array.isArray(data)) data.forEach((d) => amountsFrom(d, into));
  else if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "number" && /cents$/i.test(k)) into.add(Math.round(v) / CENTS);
      else amountsFrom(v, into);
    }
  }
  return into;
}

export function checkMoney(text: string, allowed: Set<number>, locale?: "en" | "fr"): { text: string; dropped: number } {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let dropped = 0;
  const kept: string[] = [];
  for (const s of sentences) {
    const figures = s.match(MONEY) ?? [];
    const values = figures.map((f) => parseEuros(f));
    const ok = values.every((v) => v !== null && [...allowed].some((a) => Math.abs(a - v) < 0.005));
    if (!ok) { dropped += 1; continue; }
    kept.push(locale ? figures.reduce((out, f, i) => out.replace(f, formatEuros(Math.round((values[i] ?? 0) * CENTS), locale)), s) : s);
  }
  return { text: kept.join(" ").trim(), dropped };
}

// What the model reads: every …Cents amount also as the words the reader
// sees (availableCents: 355000 → availableEuros: "€3,550.00"), so it quotes
// them formatted instead of inventing a format.
export function withEuros(data: unknown, locale: "en" | "fr"): unknown {
  if (Array.isArray(data)) return data.map((d) => withEuros(d, locale));
  if (!data || typeof data !== "object") return data;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = withEuros(v, locale);
    if (typeof v === "number" && /Cents$/.test(k)) out[k.replace(/Cents$/, "Euros")] = formatEuros(v, locale);
  }
  return out;
}
