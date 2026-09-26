// Ids only come from tool results: an argument named …Id / …Ids that isn't a
// uuid was made up, and goes back to the model instead of into a query. Pure.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function inventedIds(args: Record<string, unknown>): string[] {
  return Object.entries(args).filter(([k, v]) => {
    if (/Ids$/.test(k)) return !Array.isArray(v) || v.some((x) => typeof x !== "string" || !UUID.test(x));
    if (/Id$/.test(k)) return v !== undefined && v !== null && v !== "" && (typeof v !== "string" || !UUID.test(v));
    return false;
  }).map(([k]) => k);
}
