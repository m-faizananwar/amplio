import "server-only";
import { headers } from "next/headers";
import { TRACKED_LINK_PATH } from "../ui-constants";

// The tracked link shown to the creator is absolute (they paste it into a
// LinkedIn post), so it is built from the request's own origin.
export async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? process.env.VERCEL_URL ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Pure on purpose: callers read the origin outside any cached function
// (headers() inside unstable_cache throws) and pass it in.
export function trackedUrlFor(code: string | null, origin: string) {
  if (!code) return null;
  return `${origin}${TRACKED_LINK_PATH}/${code}`;
}
