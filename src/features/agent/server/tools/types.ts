import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import type { ConfirmEvent, ResultEvent } from "../../events";

// One tool the model may call. Reads run in the loop and return a compact
// `data` for the model (ids + key fields) plus an optional card for the UI.
// Confirm tools never run in the loop: `prepare` checks the call and states
// its facts; only a confirmed pending action reaches `execute`.
// scope: what a pending confirmation is bound to besides the user: the
// thread when there is one (so a card made on a call can be tapped on screen),
// else the browser session.
export type ToolContext = { viewer: Viewer; locale: "en" | "fr"; scope?: string };
// nextSteps: when a tool hits a blocker it names what can be done next, in the
// user's language, only things the agent's tools or pages can actually do;
// they become chips if the model doesn't ask on its own.
export type NextStep = { label: string; hint: string };
// blocker: why the tool had nothing to show, in one plain sentence from its own
// counts; it leads the reply, and the chips carry the options.
export type ToolOutput = { summary: string; data: unknown; result?: ResultEvent; navigate?: string; nextSteps?: NextStep[]; blocker?: string };
export type Prepared = { title: string; facts: ConfirmEvent["facts"]; confirmLabel: string } | { error: string; nextSteps?: NextStep[] };

type Base = { name: string; role: "brand" | "creator"; label: string; description: string; parameters: Record<string, unknown> };
export type ReadTool = Base & { kind: "read"; run: (ctx: ToolContext, args: Record<string, unknown>) => Promise<ToolOutput> };
export type ConfirmTool = Base & {
  kind: "confirm";
  prepare: (ctx: ToolContext, args: Record<string, unknown>) => Promise<Prepared>;
  execute: (ctx: ToolContext, args: Record<string, unknown>) => Promise<{ ok: boolean; summary: string }>;
};
export type AgentTool = ReadTool | ConfirmTool;

// JSON-schema helpers for the declarations Gemini reads.
export const str = (description: string) => ({ type: "string", description });
export const num = (description: string) => ({ type: "number", description });
export const arr = (description: string, items: Record<string, unknown> = { type: "string" }) => ({ type: "array", description, items });
export const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties, required });

export const day = (iso: string | null, locale: "en" | "fr") => (iso ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso)) : "—");
// A dynamic title in the viewer's language (fixed labels go through agent.json).
export const L = (ctx: ToolContext, en: string, fr: string) => (ctx.locale === "fr" ? fr : en);
export const euros = (cents: number, locale: "en" | "fr") => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
