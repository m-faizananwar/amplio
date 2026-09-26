import { bigserial, index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "../columns";
import { users } from "./users";

// Agent mode's memory. Their own tables, read optionally: if they are missing
// (prod before the migration) the agent falls back to the history the client
// sends, so nothing that exists depends on them.
export const agentThreads = pgTable(
  "agent_threads",
  {
    ...baseColumns,
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    // older turns, summarised once the history grows past the verbatim window
    summary: text("summary").notNull().default(""),
    // the confirm card a spoken or typed "yes" would answer right now
    pendingConfirm: text("pending_confirm"),
    // "chat" or "call": how the thread is listed and titled
    kind: text("kind").$type<"chat" | "call">().notNull().default("chat"),
  },
  (t) => [index("agent_threads_user_id_idx").on(t.userId)],
);

export const agentMessages = pgTable(
  "agent_messages",
  {
    ...baseColumns,
    threadId: uuid("thread_id").notNull().references(() => agentThreads.id, { onDelete: "cascade" }),
    role: text("role").$type<"user" | "assistant">().notNull(),
    text: text("text").notNull(),
  },
  (t) => [index("agent_messages_thread_id_idx").on(t.threadId)],
);

// Durable preferences the user stated ("only French creators"), recalled into
// every turn's snapshot.
export const agentNotes = pgTable(
  "agent_notes",
  {
    ...baseColumns,
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
  },
  (t) => [index("agent_notes_user_id_idx").on(t.userId)],
);

// What the agent emitted in a thread (steps, cards, confirms, navigation), in
// order, so a call's live screen can follow a turn that ran on the server.
// `seq` is the cursor the client polls with.
export const agentEvents = pgTable(
  "agent_events",
  {
    ...baseColumns,
    seq: bigserial("seq", { mode: "number" }).notNull(),
    threadId: uuid("thread_id").notNull().references(() => agentThreads.id, { onDelete: "cascade" }),
    event: jsonb("event").$type<Record<string, unknown>>().notNull(),
  },
  (t) => [index("agent_events_thread_seq_idx").on(t.threadId, t.seq)],
);
