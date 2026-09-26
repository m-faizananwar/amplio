// Every amount the agent says must come from a tool. This finds the money
// figures in a reply (€65, €1,050.00, 65,00 €, 4 685 €) and drops any
// sentence whose figure isn't one of the amounts the tools returned this turn.
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

export function checkMoney(text: string, allowed: Set<number>): { text: string; dropped: number } {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let dropped = 0;
  const kept = sentences.filter((s) => {
    const figures = s.match(MONEY) ?? [];
    const ok = figures.every((f) => { const v = parseEuros(f); return v !== null && [...allowed].some((a) => Math.abs(a - v) < 0.005); });
    if (!ok) dropped += 1;
    return ok;
  });
  return { text: kept.join(" ").trim(), dropped };
}
