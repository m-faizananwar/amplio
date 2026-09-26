import { NextResponse } from "next/server";
import { agentRequest } from "@/features/agent/events";
import { agentEnabled } from "@/features/agent/server/flag";
import { runTurn } from "@/features/agent/server/loop";
import { listNotes, openThread, saveTurn } from "@/features/agent/server/memory";
import { allowTurn } from "@/features/agent/server/rate-limit";
import { eventStream } from "@/features/agent/server/stream";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST {text, threadId?, history?, locale?} → text/event-stream of agent
// events. Runs as the signed-in user, through the same server functions and
// ownership checks as the UI; the session's CSRF token is required.
export async function POST(request: Request) {
  if (!agentEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const viewer = await getViewer().catch(() => null);
  if (!viewer || (!viewer.brand && !viewer.creator)) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (request.headers.get("x-csrf-token") !== viewer.csrfToken) return NextResponse.json({ error: "This session is stale. Reload the page." }, { status: 403 });
  if (!allowTurn(viewer.userId)) return NextResponse.json({ error: "That's a lot of requests at once. Wait a minute and try again." }, { status: 429 });
  const parsed = agentRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Say a little more and I'll try again." }, { status: 400 });
  const { text, history = [], locale = "en", threadId } = parsed.data;
  return eventStream(async (emit) => {
    // stored threads when the tables exist; otherwise the client's own history
    const [thread, notes] = await Promise.all([openThread(viewer.userId, threadId, text), listNotes(viewer.userId)]);
    const reply = await runTurn({ viewer, locale, text, history: thread ? thread.history : history, emit, recall: { notes, summary: thread?.summary ?? "" } });
    if (thread) await saveTurn(thread.threadId, { user: text, assistant: reply });
    return thread?.threadId ?? null;
  }, { userId: viewer.userId, locale });
}
