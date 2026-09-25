"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyLinkButton } from "@/features/workspace/components/CopyLinkButton";
import type { CollaborationDto, ViewerRole } from "../../schemas";

type Props = { collaboration: CollaborationDto; trackedUrl: string | null; role: ViewerRole };

// The creator's unique link and what it has produced so far.
export function TrackedLinkCard({ collaboration: c, trackedUrl, role }: Props) {
  const t = useTranslations("collaboration.detail");
  const tb = useTranslations("collaboration.briefDrawer");
  if (!trackedUrl) return null;
  return (
    <section className="grid gap-3 rounded-card border border-rule bg-surface p-5">
      <div>
        <h2 className="text-small font-medium text-ink-muted">{t("trackedLink.title")}</h2>
        <p className="text-small text-ink-muted">{role === "brand" ? t("trackedLink.bodyBrand", { creator: c.creatorName }) : t("trackedLink.body")}</p>
      </div>
      <p className="num truncate rounded-control border border-rule bg-paper px-3 py-2 text-small">{trackedUrl}</p>
      <div className="flex flex-wrap items-center gap-3">
        <CopyLinkButton value={trackedUrl} label={t("trackedLink.copy")} copied={t("trackedLink.copied")} failed={tb("copyBlocked")} size="sm" />
        {c.clicks !== null ? <span className="num text-small text-ink">{t("trackedLink.clicks", { count: c.clicks })}</span> : <span className="text-small text-ink-muted">{t("trackedLink.pending")}</span>}
        {c.postUrl ? (
          <a href={c.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-small text-info hover:underline">
            {t("draftPreview.viewPost")}<ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
