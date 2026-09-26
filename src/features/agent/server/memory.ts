import "server-only";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { agentEvents, agentMessages, agentNotes, agentThreads } from "@/db/schema";
import { generateText } from "@/features/ai/server/llm";
import type { AgentEvent } from "../events";
import { type HistoryItem, historyItems, listItem, type ThreadListItem } from "../thread-view";
import type { Turn } from "./loop";

// Threads, messages and notes, all optional: every read and write is wrapped,
// and a missing table (prod before the migration) means "no memory", never an
// error. Then the client's own history carries the conversation.
const VERBATIM_TURNS = 10;
const SUMMARY_TRIGGER_CHARS = 32_000; // ~8k tokens
const NOTES_LIMIT = 10;
const TITLE_MAX = 80;
const THREADS_LIMIT = 20;
const LOG_MAX = 160;
const EVENTS_PAGE = 100;

async function safe<T>(label: string, work: () => Promise<T>, fallback: T): Promise<T> {
  try { return await work(); } catch (error) {
    console.warn(`[agent] memory ${label} unavailable`, { error: error instanceof Error ? error.message.slice(0, LOG_MAX) : String(error) });
    return fallback;
  }
}

export type ThreadMemory = { threadId: string; summary: string; history: Turn[]; kind: "chat" | "call" };

// The thread to continue (checked to be this user's), or a new one titled by
// the first message. Null when threads can't be stored.
// keepId: a call names its own thread (from the call id), created on first use.
type Open = { title: string; keepId?: boolean; kind?: "chat" | "call" };
export async function openThread(userId: string, threadId: string | null | undefined, { title, keepId = false, kind = "chat" }: Open): Promise<ThreadMemory | null> {
  return safe("open", async () => {
    const db = getDb();
    if (threadId) {
      // explicit columns: a prod with 0007 but not 0008 must still read threads
      const [t] = await db.select({ id: agentThreads.id, summary: agentThreads.summary, kind: agentThreads.kind }).from(agentThreads).where(and(eq(agentThreads.id, threadId), eq(agentThreads.userId, userId))).limit(1);
      if (t) {
        const rows = await db.select().from(agentMessages).where(eq(agentMessages.threadId, t.id)).orderBy(desc(agentMessages.createdAt)).limit(VERBATIM_TURNS * 2);
        return { threadId: t.id, summary: t.summary, kind: t.kind, history: rows.reverse().map((r) => ({ role: r.role, text: r.text })) };
      }
    }
    const [created] = await db.insert(agentThreads).values({ ...(keepId && threadId ? { id: threadId } : {}), userId, kind, title: title.slice(0, TITLE_MAX) }).returning({ id: agentThreads.id });
    return { threadId: created.id, summary: "", history: [], kind };
  }, null);
}

// Stores the turn, and once the thread passes ~8k tokens folds everything
// but the last ten turns into its rolling summary.
export async function saveTurn(threadId: string, turn: { user: string; assistant: string }): Promise<void> {
  await safe("save", async () => {
    const db = getDb();
    await db.insert(agentMessages).values([{ threadId, role: "user", text: turn.user }, { threadId, role: "assistant", text: turn.assistant || "…" }]);
    const all = await db.select().from(agentMessages).where(eq(agentMessages.threadId, threadId)).orderBy(asc(agentMessages.createdAt));
    const chars = all.reduce((n, m) => n + m.text.length, 0);
    if (chars < SUMMARY_TRIGGER_CHARS || all.length <= VERBATIM_TURNS * 2) return;
    const older = all.slice(0, all.length - VERBATIM_TURNS * 2);
    const [t] = await db.select({ summary: agentThreads.summary }).from(agentThreads).where(eq(agentThreads.id, threadId));
    const text = older.map((m) => `${m.role}: ${m.text}`).join("\n");
    const summary = await generateText({ system: "Summarise this conversation between a user and an assistant in under 150 words: what they want, what was decided, ids mentioned. Plain text.", user: `${t?.summary ?? ""}\n${text}`, maxTokens: 400 });
    if (summary?.text) {
      await db.update(agentThreads).set({ summary: summary.text }).where(eq(agentThreads.id, threadId));
      await db.delete(agentMessages).where(inArray(agentMessages.id, older.map((m) => m.id)));
    }
  }, undefined);
}

// The user's threads to resume, newest activity first; a thread nobody said
// anything in (a call opened and hung up) is left out.
export async function listThreads(userId: string): Promise<ThreadListItem[]> {
  return safe("threads", async () => {
    // the outer table is named in full: inside a correlated subquery drizzle
    // renders the column bare ("id"), which Postgres binds to the inner table
    const turns = sql<number>`(select count(*)::int from agent_messages m where m.thread_id = agent_threads.id and m.role = 'user')`;
    const lastAt = sql<Date | null>`(select max(m.created_at) from agent_messages m where m.thread_id = agent_threads.id)`;
    const rows = await getDb()
      .select({ id: agentThreads.id, title: agentThreads.title, kind: agentThreads.kind, createdAt: agentThreads.createdAt, updatedAt: agentThreads.updatedAt, turns, lastAt })
      .from(agentThreads)
      .where(and(eq(agentThreads.userId, userId), sql`${turns} > 0`))
      .orderBy(desc(sql`coalesce(${lastAt}, ${agentThreads.updatedAt})`))
      .limit(THREADS_LIMIT);
    return rows.map((r) => listItem({ ...r, lastAt: r.lastAt ? new Date(r.lastAt) : null })).filter((t): t is ThreadListItem => t !== null);
  }, []);
}

// One thread to replay: its summary line, the card still waiting on a yes (if
// any), and everything said and shown, in order. Null if it isn't this user's.
export async function threadHistory(userId: string, threadId: string): Promise<{ thread: ThreadListItem | { id: string; title: string; kind: "chat" | "call"; turns: 0 }; pending: string | null; items: HistoryItem[] } | null> {
  if (!(await ownsThread(userId, threadId))) return null;
  return safe("history", async () => {
    const db = getDb();
    const [t] = await db.select({ id: agentThreads.id, title: agentThreads.title, kind: agentThreads.kind, createdAt: agentThreads.createdAt, updatedAt: agentThreads.updatedAt, pending: agentThreads.pendingConfirm }).from(agentThreads).where(eq(agentThreads.id, threadId)).limit(1);
    const [messages, events] = await Promise.all([
      db.select({ role: agentMessages.role, text: agentMessages.text, createdAt: agentMessages.createdAt }).from(agentMessages).where(eq(agentMessages.threadId, threadId)).orderBy(asc(agentMessages.createdAt)),
      db.select({ seq: agentEvents.seq, event: agentEvents.event }).from(agentEvents).where(eq(agentEvents.threadId, threadId)).orderBy(asc(agentEvents.seq)),
    ]);
    const turns = messages.filter((m) => m.role === "user").length;
    const thread = listItem({ ...t, turns, lastAt: messages.at(-1)?.createdAt ?? null }) ?? { id: t.id, title: t.title, kind: t.kind, turns: 0 as const };
    return { thread, pending: t.pending, items: historyItems(events.map((e) => ({ seq: e.seq, event: e.event as HistoryItem })), messages) };
  }, null);
}

export async function setTitle(threadId: string, title: string): Promise<void> {
  await safe("title", () => getDb().update(agentThreads).set({ title: title.slice(0, TITLE_MAX) }).where(eq(agentThreads.id, threadId)), undefined);
}

export async function listNotes(userId: string): Promise<string[]> {
  return safe("notes", async () => (await getDb().select({ text: agentNotes.text }).from(agentNotes).where(eq(agentNotes.userId, userId)).orderBy(desc(agentNotes.createdAt)).limit(NOTES_LIMIT)).map((n) => n.text), []);
}

export async function addNote(userId: string, text: string): Promise<boolean> {
  return safe("note", async () => {
    const db = getDb();
    const [same] = await db.select({ id: agentNotes.id }).from(agentNotes).where(and(eq(agentNotes.userId, userId), eq(agentNotes.text, text))).limit(1);
    if (!same) await db.insert(agentNotes).values({ userId, text });
    return true;
  }, false);
}

export async function ownsThread(userId: string, threadId: string): Promise<boolean> {
  return safe("owns", async () => (await getDb().select({ id: agentThreads.id }).from(agentThreads).where(and(eq(agentThreads.id, threadId), eq(agentThreads.userId, userId))).limit(1)).length === 1, false);
}

// ---- the live feed a call's screen polls (agent_events, migration 0008) ----

// Streamed message chunks are left out: the final message carries the text.
// The caller's own words are logged too ({type:"user"}), for the replay; the
// live feed leaves them out (a call shows its own transcript).
export async function appendEvents(threadId: string, events: HistoryItem[]): Promise<void> {
  const kept = events.filter((e) => e.type !== "done" && !(e.type === "message" && !e.final));
  if (kept.length === 0) return;
  await safe("events", () => getDb().insert(agentEvents).values(kept.map((event) => ({ threadId, event: event as Record<string, unknown> }))), undefined);
}

export async function eventsAfter(userId: string, threadId: string, after: number): Promise<{ events: Array<{ seq: number; event: AgentEvent }>; seq: number } | null> {
  if (!(await ownsThread(userId, threadId))) return null;
  return safe("feed", async () => {
    const rows = await getDb().select({ seq: agentEvents.seq, event: agentEvents.event }).from(agentEvents).where(and(eq(agentEvents.threadId, threadId), gt(agentEvents.seq, after))).orderBy(asc(agentEvents.seq)).limit(EVENTS_PAGE);
    const live = rows.filter((r) => (r.event as { type?: string }).type !== "user");
    return { events: live.map((r) => ({ seq: r.seq, event: r.event as AgentEvent })), seq: rows.at(-1)?.seq ?? after };
  }, { events: [], seq: after });
}

// The one confirm card a "yes" in this thread would answer.
export async function getPending(threadId: string): Promise<string | null> {
  return safe("pending", async () => (await getDb().select({ p: agentThreads.pendingConfirm }).from(agentThreads).where(eq(agentThreads.id, threadId)).limit(1))[0]?.p ?? null, null);
}

export async function setPending(threadId: string, id: string | null): Promise<void> {
  await safe("pending", () => getDb().update(agentThreads).set({ pendingConfirm: id }).where(eq(agentThreads.id, threadId)), undefined);
}
