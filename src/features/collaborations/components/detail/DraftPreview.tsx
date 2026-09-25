"use client";

import { useTranslations } from "next-intl";
import type { CollaborationDto, ViewerRole } from "../../schemas";

// The draft as last submitted, once the creator is no longer editing it.
export function DraftPreview({ collaboration: c, role }: { collaboration: CollaborationDto; role: ViewerRole }) {
  const t = useTranslations("collaboration.detail.draftPreview");
  const editing = role === "creator" && c.allowedEvents.includes("submit_draft");
  if (!c.draftText || editing) return null;
  const title = c.status === "draft_submitted" ? t("pending") : role === "creator" ? t("yours") : t("approved");
  return (
    <section className="rounded-card border border-rule bg-surface p-5">
      <h2 className="text-small font-medium text-ink-muted">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-body leading-relaxed">{c.draftText}</p>
    </section>
  );
}
