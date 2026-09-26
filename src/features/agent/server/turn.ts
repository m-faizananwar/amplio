import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import type { AgentEvent } from "../events";
import { runTurn, type Turn } from "./loop";
import { localizer } from "./localize";
import { callTitle } from "../thread-view";
import { appendEvents, listNotes, openThread, saveTurn, setPending, setTitle } from "./memory";

export type TurnRequest = { viewer: Viewer; locale: "en" | "fr"; text: string; threadId?: string | null; history?: Turn[]; emit?: (e: AgentEvent) => void; voice?: boolean };

// One turn with its memory, for chat and calls alike: continue (or start) the
// thread, run the loop, keep what it emitted as the thread's feed, and point
// the thread at the confirm card a "yes" would now answer. Without the tables
// it still runs, on the history the caller passed.
export async function agentTurn(req: TurnRequest): Promise<{ threadId: string | null; events: AgentEvent[]; reply: string }> {
  const { viewer, locale, text } = req;
  const [thread, notes] = await Promise.all([openThread(viewer.userId, req.threadId, { title: text, keepId: req.voice === true, kind: req.voice ? "call" : "chat" }), listNotes(viewer.userId)]);
  // the feed and the spoken words are in the caller's language, like the chat stream
  const local = await localizer(locale);
  const events: AgentEvent[] = [];
  const emit = (e: AgentEvent) => { events.push(local(e)); req.emit?.(e); };
  const reply = await runTurn({
    viewer, locale, text, emit, voice: req.voice,
    history: thread ? thread.history : req.history ?? [],
    recall: { notes, summary: thread?.summary ?? "" },
    scope: thread ? `thread:${thread.threadId}` : undefined,
  });
  if (thread) {
    const confirm = [...events].reverse().find((e) => e.type === "confirm");
    await Promise.all([
      saveTurn(thread.threadId, { user: text, assistant: reply }),
      // the user's words lead the turn in the log (the replay shows them; the
      // live feed doesn't)
      appendEvents(thread.threadId, [{ type: "user", text }, ...events]),
      // a call was minted untitled: it takes its name from the first real turn
      thread.kind === "call" && thread.history.length === 0 ? setTitle(thread.threadId, callTitle(text, locale)) : Promise.resolve(),
      confirm && confirm.type === "confirm" ? setPending(thread.threadId, confirm.id) : Promise.resolve(),
    ]);
  }
  return { threadId: thread?.threadId ?? null, events, reply };
}
