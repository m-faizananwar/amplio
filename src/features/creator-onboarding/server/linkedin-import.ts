import "server-only";
import { z } from "zod";

// The real LinkedIn read: a maintained Apify actor, called server-side with
// APIFY_TOKEN. Pinned to one build so an actor update can't change what we
// store under us. It returns only what the public profile says — name,
// headline, followers, country, photo; reach and engagement are not on a
// public profile, so we never fill them in.
export const LINKEDIN_ACTOR = { id: "harvestapi~linkedin-profile-scraper", build: "0.0.135" } as const;
const TIMEOUT_MS = 60_000;
const ENDPOINT = `https://api.apify.com/v2/acts/${LINKEDIN_ACTOR.id}/run-sync-get-dataset-items`;

const itemSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  headline: z.string().nullable().optional(),
  followerCount: z.number().int().nonnegative().nullable().optional(),
  photo: z.string().url().nullable().optional(),
  publicIdentifier: z.string().optional(),
  location: z.object({ countryCode: z.string().nullable().optional() }).nullable().optional(),
});

export type ImportedLinkedinProfile = {
  name: string;
  headline: string | null;
  followers: number | null;
  countryCode: string | null;
  photoUrl: string | null;
};

export type LinkedinImportResult = { ok: true; profile: ImportedLinkedinProfile } | { ok: false; reason: "unconfigured" | "timeout" | "not-found" | "failed" };

export async function importLinkedinProfile(url: string): Promise<LinkedinImportResult> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return { ok: false, reason: "unconfigured" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const params = new URLSearchParams({ token, build: LINKEDIN_ACTOR.build, timeout: String(TIMEOUT_MS / 1000) });
    const res = await fetch(`${ENDPOINT}?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [url], profileScraperMode: "Profile details no email ($4 per 1k)" }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[linkedin-import] actor call failed", { status: res.status });
      return { ok: false, reason: "failed" };
    }
    const items = (await res.json()) as unknown[];
    const parsed = itemSchema.safeParse(Array.isArray(items) ? items[0] : null);
    if (!parsed.success || !(parsed.data.firstName || parsed.data.lastName)) return { ok: false, reason: "not-found" };
    const p = parsed.data;
    return {
      ok: true,
      profile: {
        name: `${p.firstName} ${p.lastName}`.trim(),
        headline: p.headline?.trim() || null,
        followers: p.followerCount ?? null,
        countryCode: p.location?.countryCode?.toUpperCase() ?? null,
        photoUrl: p.photo ?? null,
      },
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error("[linkedin-import] actor call threw", { aborted, error: error instanceof Error ? error.message : String(error) });
    return { ok: false, reason: aborted ? "timeout" : "failed" };
  } finally {
    clearTimeout(timer);
  }
}
