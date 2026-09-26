import { NextResponse } from "next/server";
import { agentEnabled } from "@/features/agent/server/flag";
import { listThreads } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// GET → { threads: [{ id, title, updatedAt }] } for this user, newest first;
// empty when threads can't be stored. Resume one by posting its id as threadId.
export async function GET() {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  return NextResponse.json({ threads: await listThreads(viewer.userId) });
}
