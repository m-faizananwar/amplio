// Plain-language source for one click: where it came from and on what. Pure,
// so the trail drawer shows the same words for brand and creator.

const MOBILE = /iphone|ipod|android.+mobile|windows phone|mobile safari/i;
const TABLET = /ipad|tablet|android(?!.*mobile)/i;
const BOT = /bot|crawler|spider|preview|slurp|facebookexternalhit|linkedinbot/i;

export type Device = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export function deviceOf(userAgent: string | null): Device {
  if (!userAgent) return "unknown";
  if (BOT.test(userAgent)) return "bot";
  if (TABLET.test(userAgent)) return "tablet";
  if (MOBILE.test(userAgent)) return "mobile";
  return "desktop";
}

// "www.linkedin.com" → "linkedin.com"; no referrer means the link was typed,
// pasted or opened from an app that strips it.
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
