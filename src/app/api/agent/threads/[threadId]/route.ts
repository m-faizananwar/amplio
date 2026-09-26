import { NextResponse } from "next/server";
import { agentEnabled } from "@/features/agent/server/flag";
import { threadHistory } from "@/features/agent/server/memory";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// GET → { thread: { id, title, kind, turns, updatedAt, durationSec? }, pending,
// items }: one thread to replay, chat or call, exactly as it happened. items
// are { type: "user", text } turns and the agent's own events (step, result,
// question, confirm, resolved, message) in order; `pending` is the confirm id
// still waiting on a yes, if any. Only the thread's owner; 404 otherwise.
export async function GET(_request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { threadId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(threadId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const history = await threadHistory(viewer.userId, threadId);
  if (!history) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(history, { headers: { "cache-control": "no-store" } });
}
