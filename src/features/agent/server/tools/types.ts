import "server-only";
import type { Viewer } from "@/features/auth/server/session";
import type { ConfirmEvent, ResultEvent } from "../../events";

// One tool the model may call. Reads run in the loop and return a compact
// `data` for the model (ids + key fields) plus an optional card for the UI.
// Confirm tools never run in the loop: `prepare` checks the call and states
// its facts; only a confirmed pending action reaches `execute`.
export type ToolContext = { viewer: Viewer; locale: "en" | "fr" };
export type ToolOutput = { summary: string; data: unknown; result?: ResultEvent };
export type Prepared = { title: string; facts: ConfirmEvent["facts"]; confirmLabel: string } | { error: string };

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
export const euros = (cents: number, locale: "en" | "fr") => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
