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

export function describeFilters(args: SearchArgs, locale: "en" | "fr" = "en"): string[] {
  const fr = locale === "fr";
  const out: string[] = [];
  const countries = list(args.countries);
  if (countries.length) out.push(`${fr ? "pays" : "country"} ${countries.join(", ")}`);
  const industries = list(args.industries);
  if (industries.length) out.push(`${fr ? "secteur" : "industry"} ${industries.join(", ")}`);
  const min = num(args.minPriceEuros);
  const max = num(args.maxPriceEuros);
  if (min !== null) out.push(fr ? `≥ ${min} €` : `≥ €${min}`);
  if (max !== null) out.push(fr ? `≤ ${max} €` : `≤ €${max}`);
  const followers = num(args.minFollowers);
  if (followers !== null) out.push(`≥ ${followers} ${fr ? "abonnés" : "followers"}`);
  if (typeof args.query === "string" && args.query.trim()) out.push(`"${args.query.trim()}"`);
  return out;
}

// Why a search shows nobody, in one plain sentence from its own counts: no
// match at all, or matches that are all already on the campaign or below the
// follower floor. Only claims what it scanned. Pure.
export type EmptySearch = { total: number; scanned: number; already: number; belowFollowers: number; minFollowers: number; applied: string[]; locale: "en" | "fr" };

export function emptySearchReason({ total, scanned, already, belowFollowers, minFollowers, applied, locale }: EmptySearch): string {
  const fr = locale === "fr";
  if (total === 0) {
    const what = applied.length ? applied.join(" · ") : fr ? "cette recherche" : "this search";
    return fr ? `Aucun créateur ne correspond à ${what}.` : `No creators match ${what}.`;
  }
  const n = scanned < total ? (fr ? `Les ${scanned} premiers sur ${total}` : `The top ${scanned} of ${total} matches`) : fr ? `${total} correspondent` : `${total} match`;
  if (belowFollowers === 0) return fr ? `${n}, mais tous sont déjà sur cette campagne.` : `${n}, but all are already on this campaign.`;
  if (already === 0) return fr ? `${n}, mais aucun n'a au moins ${minFollowers} abonnés.` : `${n}, but none has at least ${minFollowers} followers.`;
  return fr
    ? `${n}, mais ${already} sont déjà sur cette campagne et les autres ont moins de ${minFollowers} abonnés.`
    : `${n}, but ${already} are already on this campaign and the rest have fewer than ${minFollowers} followers.`;
}
