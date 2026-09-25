import { NextResponse } from "next/server";
import { TRAIL_TTL_S } from "@/features/public/constants";
import { getPublicTrail } from "@/features/public/server/trail-queries";

// Public, read-only: the demo workspace's post → link → click → sign-up counts.
export async function GET() {
  const trail = await getPublicTrail();
  if (!trail) return NextResponse.json({ ok: false, error: "Trail unavailable" }, { status: 503 });
  return NextResponse.json(
    { ok: true, data: { ...trail, label: "demo workspace data" } },
    { headers: { "Cache-Control": `public, s-maxage=${TRAIL_TTL_S}, stale-while-revalidate=${TRAIL_TTL_S}` } },
  );
}
