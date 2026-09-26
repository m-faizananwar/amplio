import { z } from "zod";

// The agent's wire contract: one Server-Sent Event per item, `data:` a JSON
// object of one of these shapes. POST /api/agent streams them for a turn;
// POST /api/agent/confirm streams the continuation after a confirmed action.
// The UI renders exactly these; nothing else crosses the wire.

const MAX_CHIPS = 4;

export const stepStatus = z.enum(["running", "done", "failed"]);

// One tool call, shown as it runs and again when it settles (same id).
export const stepEvent = z.object({
  type: z.literal("step"),
  id: z.string(),
  label: z.string(),
  status: stepStatus,
  tool: z.string(),
  input: z.string().optional(),
  output: z.string().optional(),
});

// The agent needs something before it can go on; chips are quick replies.
export const questionEvent = z.object({
  type: z.literal("question"),
  text: z.string(),
  chips: z.array(z.string()).max(MAX_CHIPS).default([]),
});

// ---- results: compact, typed payloads the UI renders as cards ----
const money = z.number().int(); // cents
export const creatorCard = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  headline: z.string(),
  country: z.string(),
  industries: z.array(z.string()),
  followers: z.number().int(),
  priceCents: money,
  fitScore: z.number().int().min(0).max(100).optional(),
  fitReason: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});
export const campaignCard = z.object({ id: z.string(), name: z.string(), status: z.string(), postDeadline: z.string().nullable(), budgetCents: money.nullable().optional() });
export const collaborationCard = z.object({ id: z.string(), campaign: z.string(), counterpart: z.string(), status: z.string(), nextAction: z.string(), feeCents: money });
export const opportunityCard = z.object({ campaignId: z.string(), campaign: z.string(), brand: z.string(), fitScore: z.number().int(), priceCents: money, postDeadline: z.string().nullable() });

export const resultEvent = z.discriminatedUnion("kind", [
  z.object({ type: z.literal("result"), kind: z.literal("creators"), title: z.string(), items: z.array(creatorCard) }),
  z.object({ type: z.literal("result"), kind: z.literal("creator"), title: z.string(), item: creatorCard.extend({ signals: z.array(z.object({ key: z.string(), score: z.number(), weight: z.number() })).optional() }) }),
  z.object({ type: z.literal("result"), kind: z.literal("brand"), title: z.string(), item: z.object({ company: z.string(), website: z.string().nullable(), industries: z.array(z.string()), regions: z.array(z.string()), valueProp: z.string() }) }),
  z.object({ type: z.literal("result"), kind: z.literal("campaign"), title: z.string(), item: campaignCard.extend({ brief: z.string().optional() }) }),
  z.object({ type: z.literal("result"), kind: z.literal("collaborations"), title: z.string(), items: z.array(collaborationCard) }),
  z.object({ type: z.literal("result"), kind: z.literal("wallet"), title: z.string(), item: z.object({ availableCents: money, heldCents: money }) }),
  z.object({ type: z.literal("result"), kind: z.literal("opportunities"), title: z.string(), items: z.array(opportunityCard) }),
  z.object({ type: z.literal("result"), kind: z.literal("earnings"), title: z.string(), item: z.object({ availableCents: money, awaitingCents: money, withdrawnCents: money, earnedCents: money }) }),
]);

// A money or collaboration change the agent will not make on its own: the
// UI shows the facts and posts {id} to /api/agent/confirm (or the user says yes).
export const confirmEvent = z.object({
  type: z.literal("confirm"),
  id: z.string(),
  title: z.string(),
  facts: z.array(z.object({ label: z.string(), value: z.string(), cents: money.optional() })),
  confirmLabel: z.string(),
  cancelLabel: z.string(),
  expiresAt: z.string(),
});

// Assistant text, streamed: chunks of one message share an id and append;
// the `final` event closes it and carries the WHOLE text (replace, don't append).
export const messageEvent = z.object({ type: z.literal("message"), id: z.string(), text: z.string(), final: z.boolean().default(false) });
// The agent opened a page (internal path only); the call widget follows it.
export const navigateEvent = z.object({ type: z.literal("navigate"), href: z.string().regex(/^\/(brand|creator)(\/[\w\-/?=&.%]*)?$/), label: z.string().optional() });
// A confirm card was answered (by a tap, or by a spoken yes on a call).
export const resolvedEvent = z.object({ type: z.literal("resolved"), id: z.string(), outcome: z.enum(["done", "cancelled", "failed"]) });
export const doneEvent = z.object({ type: z.literal("done"), threadId: z.string().nullable() });
export const errorEvent = z.object({ type: z.literal("error"), message: z.string(), retryable: z.boolean().default(false) });

export const agentEvent = z.union([stepEvent, questionEvent, resultEvent, confirmEvent, messageEvent, navigateEvent, resolvedEvent, doneEvent, errorEvent]);
export type AgentEvent = z.infer<typeof agentEvent>;
export type StepEvent = z.infer<typeof stepEvent>;
export type ResultEvent = z.infer<typeof resultEvent>;
export type ConfirmEvent = z.infer<typeof confirmEvent>;
export type CreatorCard = z.infer<typeof creatorCard>;

// The request bodies.
export const AGENT_INPUT_MAX = 2000;
export const agentRequest = z.object({
  text: z.string().trim().min(1).max(AGENT_INPUT_MAX),
  threadId: z.string().nullable().optional(),
  // used only when threads can't be stored: the client's own recent turns
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(AGENT_INPUT_MAX * 2) })).max(20).optional(),
  locale: z.enum(["en", "fr"]).optional(),
});
export const confirmRequest = z.object({ id: z.string().min(1), threadId: z.string().nullable().optional(), decision: z.enum(["confirm", "cancel"]).default("confirm") });

// Encode one event as an SSE frame.
export function sse(event: AgentEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
