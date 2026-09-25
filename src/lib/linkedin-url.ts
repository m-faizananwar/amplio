// linkedin.com/in/<slug>, lower-cased, without query or trailing slash: two
// spellings of the same profile are the same profile (and the same cached read).
export function normalizeLinkedinUrl(url: string) {
  const m = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? `https://www.linkedin.com/in/${decodeURIComponent(m[1]).toLowerCase()}` : url.trim();
}
