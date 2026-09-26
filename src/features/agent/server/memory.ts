import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { agentMessages, agentNotes, agentThreads } from "@/db/schema";
import { generateText } from "@/features/ai/server/llm";
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

async function safe<T>(label: string, work: () => Promise<T>, fallback: T): Promise<T> {
  try { return await work(); } catch (error) {
    console.warn(`[agent] memory ${label} unavailable`, { error: error instanceof Error ? error.message.slice(0, LOG_MAX) : String(error) });
    return fallback;
  }
}

export type ThreadMemory = { threadId: string; summary: string; history: Turn[] };

// The thread to continue (checked to be this user's), or a new one titled by
// the first message. Null when threads can't be stored.
export async function openThread(userId: string, threadId: string | null | undefined, firstText: string): Promise<ThreadMemory | null> {
  return safe("open", async () => {
    const db = getDb();
    if (threadId) {
      const [t] = await db.select().from(agentThreads).where(and(eq(agentThreads.id, threadId), eq(agentThreads.userId, userId))).limit(1);
      if (t) {
        const rows = await db.select().from(agentMessages).where(eq(agentMessages.threadId, t.id)).orderBy(desc(agentMessages.createdAt)).limit(VERBATIM_TURNS * 2);
        return { threadId: t.id, summary: t.summary, history: rows.reverse().map((r) => ({ role: r.role, text: r.text })) };
      }
    }
    const [created] = await db.insert(agentThreads).values({ userId, title: firstText.slice(0, TITLE_MAX) }).returning({ id: agentThreads.id });
    return { threadId: created.id, summary: "", history: [] };
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

export async function listThreads(userId: string) {
  return safe("threads", () => getDb().select({ id: agentThreads.id, title: agentThreads.title, updatedAt: agentThreads.updatedAt }).from(agentThreads).where(eq(agentThreads.userId, userId)).orderBy(desc(agentThreads.updatedAt)).limit(THREADS_LIMIT), []);
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
