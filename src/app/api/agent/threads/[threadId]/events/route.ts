import { NextResponse } from "next/server";
import { agentEnabled } from "@/features/agent/server/flag";
import { eventsAfter } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// GET ?after=<seq> → { events: [{ seq, event }], seq }: what the agent emitted
// in this thread since that cursor (a call runs on the server; its screen
// polls this about once a second). Only the thread's owner; 404 otherwise.
export async function GET(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { threadId } = await params;
  const after = Number(new URL(request.url).searchParams.get("after") ?? 0);
  if (!/^[0-9a-f-]{36}$/i.test(threadId) || !Number.isFinite(after)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const feed = await eventsAfter(viewer.userId, threadId, after);
  if (!feed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(feed, { headers: { "cache-control": "no-store" } });
}
