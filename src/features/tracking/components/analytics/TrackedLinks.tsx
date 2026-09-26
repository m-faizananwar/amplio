"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip, statusTone } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHead } from "./SectionHead";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import type { TrackedLinkPerformance } from "@/features/tracking/server/creator-queries";
import { LinkRipplesScene } from "@/components/graphics/scenes";

// One tracked link per collaboration; its click count opens its own clicks.
export function TrackedLinks({ links, onOpen }: { links: TrackedLinkPerformance[]; onOpen: (l: TrackedLinkPerformance) => void }) {
  const t = useTranslations("creator.analytics");
  const ts = useTranslations("collaboration.status");
  const format = useFormatter();
  return (
    <section className="grid gap-3">
      <SectionHead title={t("trackedLinks.title")} description={t("trackedLinks.description")} />
      {links.length === 0 ? (
        <EmptyState size="compact" illustration={<LinkRipplesScene />} title={t("empty.noLinks.title")} body={t("empty.noLinks.body")} action={<Link href="/creator/opportunities" className={buttonVariants({ variant: "secondary" })}>{t("empty.noLinks.action")}</Link>} />
      ) : (
        <Table framed>
          <TableHeader>
            <TableRow>
              <TableHead>{t("trackedLinks.headers.brand")}</TableHead>
              <TableHead>{t("trackedLinks.headers.status")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("trackedLinks.headers.link")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("trackedLinks.headers.published")}</TableHead>
              <TableHead className="text-right">{t("trackedLinks.headers.clicks")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((l) => (
              <TableRow key={l.collaborationId}>
                <TableCell><span className="block font-medium">{l.brand}</span><span className="block text-caption text-ink-muted">{l.campaign}</span></TableCell>
                <TableCell><StatusChip tone={statusTone(l.status as CollaborationStatus)} status={l.status as CollaborationStatus}>{ts(l.status)}</StatusChip></TableCell>
                <TableCell className="num hidden text-small text-ink-muted md:table-cell">/r/{l.code}</TableCell>
                <TableCell className="num hidden text-small text-ink-muted sm:table-cell">{l.publishedAt ? format.dateTime(new Date(l.publishedAt), { dateStyle: "medium" }) : t("trackedLinks.notPublished")}</TableCell>
                <TableCell className="text-right">
                  <button type="button" onClick={() => onOpen(l)} className="num rounded-control px-2 py-1 text-money hover:bg-tint">{format.number(l.clicks)}</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
