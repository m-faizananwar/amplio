// Seeded demo data is labelled wherever it is shown publicly (DIRECTION,
// Honesty). The seed only uses reserved addresses — the demo domains,
// example.com and the .example TLD (RFC 2606) — which no real sign-up can
// have, so an email is enough to tell them apart.
const RESERVED = [/@example\.com$/i, /\.example$/i];

export function isSeededEmail(email: string, demoDomains: readonly string[]): boolean {
  const lower = email.toLowerCase();
  return RESERVED.some((re) => re.test(lower)) || demoDomains.some((d) => lower.endsWith(`@${d.toLowerCase()}`));
}
