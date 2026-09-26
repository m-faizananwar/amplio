import "server-only";
import { getTranslations } from "next-intl/server";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import type { NextStepFilter } from "@/lib/next-step";

type Item = { status: CollaborationStatus; nextAction: NextStepFilter };

// What the model reads for each collaboration: the status and who moves next
// in the viewer's words ("Draft sent", "waiting on the creator"), beside the
// keys the card uses, so no snake_case key ends up in a reply.
export async function withCollabWords<T extends Item>(items: T[], role: "brand" | "creator", locale: "en" | "fr") {
  const [status, labels] = await Promise.all([
    getTranslations({ locale, namespace: "collaboration.status" }),
    getTranslations({ locale, namespace: "agent.labels" }),
  ]);
  const next = (key: NextStepFilter) => labels(key === "waiting" ? `next_waiting_${role}` : `next_${key}`);
  // the app's "invited" label is the creator's ("Invitation reçue"); a brand
  // reads it from its own side, as the agent's cards do
  const label = (s: CollaborationStatus) => (s === "invited" && role === "brand" ? labels("status_invited_brand") : status(s));
  return items.map((c) => ({ ...c, statusLabel: label(c.status), nextStep: next(c.nextAction) }));
}
