import { NextResponse } from "next/server";
import { confirmRequest } from "@/features/agent/events";
import { agentEnabled } from "@/features/agent/server/flag";
import { runConfirmed } from "@/features/agent/server/confirm";
import { eventStream } from "@/features/agent/server/stream";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST {id, decision} → text/event-stream: the confirmed action runs (only
// here, only for the user and session it was prepared for, only before it
// expires), then the agent says what happened and what's next.
export async function POST(request: Request) {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer || (!viewer.brand && !viewer.creator)) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (request.headers.get("x-csrf-token") !== viewer.csrfToken) return NextResponse.json({ error: "This session is stale. Reload the page." }, { status: 403 });
  const parsed = confirmRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nothing to confirm." }, { status: 400 });
  const locale = request.headers.get("accept-language")?.startsWith("fr") ? "fr" : "en";
  return eventStream((emit) => runConfirmed({ viewer, locale, id: parsed.data.id, decision: parsed.data.decision, emit, threadId: parsed.data.threadId }), { userId: viewer.userId });
}
