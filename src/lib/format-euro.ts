// Prices print as "188 €", "169.2 €", "5 625 €": space-grouped
// thousands, dot decimals, trailing euro sign.
const CENTS_PER_EURO = 100;
const MAX_DECIMALS = 2;
const GROUP = 3;

function groupThousands(integer: string) {
  const out: string[] = [];
  for (let i = integer.length; i > 0; i -= GROUP) out.unshift(integer.slice(Math.max(0, i - GROUP), i));
  return out.join(" ");
}

export function formatEuroAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const euros = Math.abs(cents) / CENTS_PER_EURO;
  const fixed = euros.toFixed(MAX_DECIMALS).replace(/\.?0+$/, "");
  const [integer, decimals] = fixed.split(".");
  return `${sign}${groupThousands(integer)}${decimals ? `.${decimals}` : ""}`;
}

export function formatEuro(cents: number): string {
  return `${formatEuroAmount(cents)} €`;
}

// 17.3K, 1.2M, 950 — the compact style for follower and view counts on cards.
const THOUSAND = 1000;
const MILLION = 1_000_000;
const COMPACT_DECIMALS = 1;

export function formatCompact(value: number): string {
  if (value >= MILLION) return `${trimZero((value / MILLION).toFixed(COMPACT_DECIMALS))}M`;
  if (value >= THOUSAND) return `${trimZero((value / THOUSAND).toFixed(COMPACT_DECIMALS))}K`;
  return String(Math.round(value));
}

function trimZero(text: string) {
  return text.replace(/\.0$/, "");
}

// CPMs are shown to the euro ("11 €"), never with cents.
export function formatEuroWhole(cents: number): string {
  return formatEuro(Math.round(cents / CENTS_PER_EURO) * CENTS_PER_EURO);
}
