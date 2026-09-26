import type { AgentEvent } from "./events";

// How threads are listed and replayed. Pure.

export type ThreadKind = "chat" | "call";
export type ThreadRow = { id: string; title: string; kind: string | null; createdAt: Date; updatedAt: Date; turns: number; lastAt: Date | null };
export type ThreadListItem = { id: string; title: string; kind: ThreadKind; turns: number; updatedAt: string; durationSec?: number };

const MS = 1000;

// A thread nobody said anything in (a call that was opened and hung up) is
// not listed; a call lasts from its start to its last turn.
export function listItem(row: ThreadRow): ThreadListItem | null {
  if (row.turns <= 0) return null;
  const kind: ThreadKind = row.kind === "call" ? "call" : "chat";
  const last = row.lastAt && row.lastAt > row.updatedAt ? row.lastAt : row.updatedAt;
  const item: ThreadListItem = { id: row.id, title: row.title, kind, turns: row.turns, updatedAt: last.toISOString() };
  if (kind === "call" && row.lastAt) item.durationSec = Math.max(0, Math.round((row.lastAt.getTime() - row.createdAt.getTime()) / MS));
  return item;
}

const TITLE_WORDS = 60;
// A call is titled from what was first asked in it: "Call · find 2 creators in France".
export function callTitle(firstText: string, locale: "en" | "fr"): string {
  const said = firstText.trim().replace(/\s+/g, " ");
  const cut = said.length > TITLE_WORDS ? `${said.slice(0, TITLE_WORDS).replace(/\s+\S*$/, "")}…` : said;
  return `${locale === "fr" ? "Appel" : "Call"} · ${cut}`;
}

// ---- replay ----
export type UserTurn = { type: "user"; text: string };
export type HistoryItem = AgentEvent | UserTurn;
type StoredEvent = { seq: number; event: HistoryItem };
type StoredMessage = { role: "user" | "assistant"; text: string };

const REPLAYED = new Set(["user", "step", "result", "question", "confirm", "resolved", "message"]);

// A step is logged running and again when it settles (same id, within one
// turn): the replay keeps one row, in its final state, where it started.
function finalSteps(items: HistoryItem[]): HistoryItem[] {
  const out: HistoryItem[] = [];
  let turnStart = 0;
  for (const item of items) {
    if (item.type === "user") turnStart = out.length;
    const at = item.type === "step" ? out.findIndex((o, i) => i >= turnStart && o.type === "step" && o.id === item.id) : -1;
    if (at >= 0) out[at] = item; else out.push(item);
  }
  return out;
}

// The thread as it happened: the user's words, then what the agent showed and
// said, turn by turn, from the event log. Threads from before the log existed
// replay from their stored messages. The title is never an item.
export function historyItems(events: StoredEvent[], messages: StoredMessage[]): HistoryItem[] {
  const logged = [...events].sort((a, b) => a.seq - b.seq).map((e) => e.event).filter((e) => REPLAYED.has(e.type));
  if (logged.some((e) => e.type === "user")) return finalSteps(logged);
  return messages.map((m, i): HistoryItem => (m.role === "user" ? { type: "user", text: m.text } : { type: "message", id: `h${i}`, text: m.text, final: true }));
}
