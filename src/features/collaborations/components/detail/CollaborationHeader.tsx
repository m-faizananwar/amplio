"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PartyAvatar } from "@/components/PartyAvatar";
import { buttonVariants } from "@/components/ui/button";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import { THREAD_STATUSES } from "@/lib/collaboration-labels";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import { ownerFor } from "@/lib/next-step";
import type { BriefDto, CollaborationDto, ViewerRole } from "../../schemas";
import { ViewBriefButton } from "../brief/ViewBriefButton";
import { useDetailFormat } from "./useDetailFormat";
import { StatusGlyph } from "@/components/graphics/StatusGlyph";

type Props = { collaboration: CollaborationDto; status: CollaborationStatus; role: ViewerRole; brief: BriefDto };

// Who the collaboration is with, where it stands, and the next step in one line.
export function CollaborationHeader({ collaboration: c, status, role, brief }: Props) {
  const t = useTranslations("collaboration");
  const fmt = useDetailFormat();
  const other = role === "creator" ? c.brandCompany : c.creatorName;
  const vars = { brand: c.brandCompany, creator: c.creatorName, round: c.revisionRound, max: c.maxRevisionRounds, amount: fmt.money(c.feeCents) };
  const yours = ownerFor(status, role) === "you";
  return (
    <header className="mb-6 grid gap-4">
      <Link href={`/${role}/collaborations`} className="inline-flex w-fit items-center gap-1 text-small text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" />{t("detail.back")}
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <PartyAvatar name={other} kind={role === "creator" ? "brand" : "person"} src={role === "brand" ? c.creatorAvatarUrl : null} size="lg" />
          <div className="min-w-0">
            <h1 className="text-h3">{other}</h1>
            <p className="text-ink-muted">{c.campaignName}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-small">
              <StatusGlyph key={status} status={status} className="size-5 text-ink" />
              <StatusChip tone={statusTone(status)}>{t(`status.${status}`)}</StatusChip>
              <span className={yours ? "font-medium text-ink" : "text-ink-muted"}>{t(`nextAction.${role}.${status}.action`, vars)}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ViewBriefButton brief={brief} />
          {THREAD_STATUSES.includes(status) ? (
            <Link href={`/${role}/messages/${c.id}`} className={buttonVariants({ variant: "secondary" })}>
              <MessageCircle aria-hidden="true" />
              {t(`detail.${role}.header.message`, vars)}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
