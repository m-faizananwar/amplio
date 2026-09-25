"use server";

import { getViewer } from "@/features/auth/server/session";
import { type BrandTrail, type BrandTrailKind, getBrandTrail } from "./trail-queries";

const KINDS: readonly BrandTrailKind[] = ["clicks", "signups", "spend", "reach"];

// The rows behind one of the brand's numbers, fetched when the drawer opens
// (not with the page). A read exposed as an action because the client asks.
export async function loadBrandTrail(kind: string): Promise<{ ok: true; data: BrandTrail } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer?.brand) return { ok: false, error: "unauthorized" };
  if (!(KINDS as readonly string[]).includes(kind)) return { ok: false, error: "unknown" };
  try {
    return { ok: true, data: await getBrandTrail(viewer.brand.id, kind as BrandTrailKind) };
  } catch (error) {
    console.error("[tracking] trail failed", { brandId: viewer.brand.id, kind, error });
    return { ok: false, error: "failed" };
  }
}
