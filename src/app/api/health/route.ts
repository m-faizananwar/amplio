import { NextResponse } from "next/server";
import { pingDatabase } from "@/db/health";
import { probeProvider } from "@/features/ai/server/llm";
import { aiProvider, demotedProviders } from "@/features/ai/server/provider";
import { aiKeyEnvNames } from "@/lib/ai-provider";
import { publicHealth } from "@/lib/public-health";

export const dynamic = "force-dynamic";

const HTTP_SERVICE_UNAVAILABLE = 503;

// Smoke test after every deploy: { ok, db, ai, voice, email, commit }. The
// diagnostics (which env var names were used, provider errors) are logged
// server-side when something is off, not published.
export async function GET() {
  const [db, ai] = await Promise.all([pingDatabase(), probeProvider()]);
  const demoted = demotedProviders();
  if (!db.ok || ai.probeError || Object.keys(demoted).length) {
    console.warn("[health] degraded", { db, dbEnv: db.via, ai, aiResolved: aiProvider().name, aiEnv: aiKeyEnvNames(process.env), aiDemoted: demoted });
  }
  const body = publicHealth({ db, ai, env: process.env });
  return NextResponse.json(body, { status: db.ok ? 200 : HTTP_SERVICE_UNAVAILABLE });
}
