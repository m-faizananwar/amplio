import { NextResponse } from "next/server";
import { agentEnabled } from "@/features/agent/server/flag";
import { listNotes, listThreads } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// GET → { threads: [{ id, title, updatedAt }], notes: string[] } for this user,
// newest first; both empty when memory can't be stored. Resume a thread by
// posting its id as threadId.
export async function GET() {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const [threads, notes] = await Promise.all([listThreads(viewer.userId), listNotes(viewer.userId)]);
  return NextResponse.json({ threads, notes });
}
