"use client";

import { useTranslations } from "next-intl";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import type { Actor, CollaborationEvent } from "@/lib/collaboration-status";
import { timelineKey } from "@/lib/timeline-key";
import type { CollaborationDto, CollaborationEventDto, ViewerRole } from "../../schemas";
import { useDetailFormat } from "./useDetailFormat";

type Props = { events: CollaborationEventDto[]; role: ViewerRole; collaboration: CollaborationDto };

// Every collaboration_events row, oldest first: who did what, and when —
// written from the viewer's side ("You accepted…" / "{brand} accepted…").
export function EventTimeline({ events, role, collaboration: c }: Props) {
  const t = useTranslations("collaboration");
  const fmt = useDetailFormat();
  return (
    <section className="rounded-card border border-rule bg-surface p-5">
      <h2 className="text-small font-medium text-ink-muted">{t("detail.timelineTitle")}</h2>
      {events.length === 0 ? <p className="mt-3 text-small text-ink-muted">{t("detail.timelineEmpty")}</p> : null}
      <ol className="list-stagger relative mt-4 grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-[3px] before:w-px before:bg-rule">
        {events.map((e, i) => {
          const key = timelineKey(e.event as CollaborationEvent, e.actor as Actor, e.fromStatus);
          const round = events.slice(0, i + 1).filter((x) => x.event === "submit_draft").length;
          const vars = { brand: c.brandCompany, creator: c.creatorName, round, date: c.scheduledAt ? fmt.date(c.scheduledAt) : "" };
          return (
            <li key={e.id} className="relative grid gap-1 pl-5">
              <span aria-hidden="true" className={`absolute top-1.5 left-0 size-[7px] rounded-chip ${i === events.length - 1 ? "bg-ink" : "bg-rule-strong"}`} />
              <p className="flex flex-wrap items-center gap-2 text-small">
                <span className="font-medium text-ink">{t(`detail.${role}.timeline.${key}`, vars)}</span>
                <StatusChip tone={statusTone(e.toStatus)} status={e.toStatus}>{t(`status.${e.toStatus}`)}</StatusChip>
              </p>
              <time dateTime={e.createdAt} className="num text-caption text-ink-muted">{fmt.dateTime(e.createdAt)}</time>
              {e.note ? <blockquote className="rounded-control bg-paper px-3 py-2 text-small">{e.note}</blockquote> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
