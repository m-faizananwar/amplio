import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";
import { expireTags } from "@/db/cache";
import { tagsForMutation } from "@/lib/cache-tags";
import { brands, clicks, pixelEvents } from "@/db/schema";
import type { PixelEventInput } from "../schemas";

const CENTS = 100;

// One row per event from /n.js. Unknown site keys and click ids are ignored
// silently: the pixel must never break a customer's page.
export async function recordPixelEvent(input: PixelEventInput) {
  if (!isDbConfigured()) return false;
  const db = getDb();
  const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.pixelSiteKey, input.site));
  if (!brand) return false;
  let clickId: string | null = null;
  if (input.clickId) {
    const [click] = await db.select({ id: clicks.id }).from(clicks).where(eq(clicks.id, input.clickId));
    clickId = click?.id ?? null;
  }
  await db.insert(pixelEvents).values({
    brandId: brand.id,
    clickId,
    type: input.type,
    valueCents: Math.round((input.value ?? 0) * CENTS),
    visitorId: input.visitorId ?? null,
  });
  expireTags(tagsForMutation("tracking", { brandId: brand.id }));
  return true;
}
