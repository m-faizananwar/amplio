// What a creator search actually filtered on, in words, so the step shows it
// and the model can only claim filters that were applied. Pure.
export type SearchArgs = { countries?: unknown; industries?: unknown; minPriceEuros?: unknown; maxPriceEuros?: unknown; minFollowers?: unknown; query?: unknown; limit?: unknown };

export const SEARCH_DEFAULT = 6;
export const SEARCH_MAX = 10;
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : []);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function searchLimit(args: SearchArgs): number {
  const n = num(args.limit);
  return n === null ? SEARCH_DEFAULT : Math.min(SEARCH_MAX, Math.max(1, Math.round(n)));
}

export function describeFilters(args: SearchArgs): string[] {
  const out: string[] = [];
  const countries = list(args.countries);
  if (countries.length) out.push(`country ${countries.join(", ")}`);
  const industries = list(args.industries);
  if (industries.length) out.push(`industry ${industries.join(", ")}`);
  const min = num(args.minPriceEuros);
  const max = num(args.maxPriceEuros);
  if (min !== null) out.push(`≥ €${min}`);
  if (max !== null) out.push(`≤ €${max}`);
  const followers = num(args.minFollowers);
  if (followers !== null) out.push(`≥ ${followers} followers`);
  if (typeof args.query === "string" && args.query.trim()) out.push(`"${args.query.trim()}"`);
  return out;
}
