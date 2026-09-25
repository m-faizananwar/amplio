"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHead } from "./SectionHead";
import type { PublicPostDto } from "@/features/tracking/server/creator-queries";

const SNIPPET = 80;

// The public posts in the range, newest first, with their figures.
export function PostsTable({ posts }: { posts: PublicPostDto[] }) {
  const t = useTranslations("creator.analytics");
  const format = useFormatter();
  const n = (v: number) => format.number(v);
  return (
    <section className="grid gap-3">
      <SectionHead title={t("posts.title")} description={t("posts.description")} />
      {posts.length === 0 ? (
        <EmptyState size="compact" title={t("empty.noPosts.title")} body={t("empty.noPosts.body")} action={<Link href="/creator/settings#linkedin" className={buttonVariants({ variant: "secondary" })}>{t("empty.noPosts.action")}</Link>} />
      ) : (
        <Table framed>
          <TableHeader>
            <TableRow>
              <TableHead>{t("posts.headers.post")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("posts.headers.date")}</TableHead>
              <TableHead className="text-right">{t("posts.headers.impressions")}</TableHead>
              <TableHead className="hidden text-right md:table-cell">{t("posts.headers.reactions")}</TableHead>
              <TableHead className="hidden text-right md:table-cell">{t("posts.headers.comments")}</TableHead>
              <TableHead className="hidden text-right md:table-cell">{t("posts.headers.reposts")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-sm"><a href={p.url} target="_blank" rel="noreferrer" className="block truncate hover:underline" title={t("posts.open")}>{p.body.length > SNIPPET ? `${p.body.slice(0, SNIPPET)}…` : p.body}</a></TableCell>
                <TableCell className="num hidden text-small text-ink-muted sm:table-cell">{format.dateTime(new Date(p.postedAt), { dateStyle: "medium" })}</TableCell>
                <TableCell className="num text-right">{n(p.impressions)}</TableCell>
                <TableCell className="num hidden text-right md:table-cell">{n(p.reactions)}</TableCell>
                <TableCell className="num hidden text-right md:table-cell">{n(p.comments)}</TableCell>
                <TableCell className="num hidden text-right md:table-cell">{n(p.reposts)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
