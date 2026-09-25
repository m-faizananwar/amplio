import { ExternalLink } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PersonAvatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PublishedPost } from "../../server/queries";
import { Section } from "./Section";

// Live posts and the clicks on their tracked link. Reactions and comments are
// the creator's recent public averages — LinkedIn's numbers for the sponsored
// post itself aren't imported, and the section says so.
export async function PublishedPosts({ posts }: { posts: PublishedPost[] }) {
  const t = await getTranslations("brand.results.posts");
  const format = await getFormatter();
  return (
    <Section id="posts-title" title={t("title")} description={t("description")}>
      {posts.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule-strong bg-surface px-5 py-8 text-center text-body text-ink-muted">{t("empty")}</p>
      ) : (
        <Table framed>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.creator")}</TableHead>
              <TableHead>{t("columns.published")}</TableHead>
              <TableHead>{t("columns.link")}</TableHead>
              <TableHead className="text-right">{t("columns.clicks")}</TableHead>
              <TableHead className="text-right">{t("columns.reactions")}</TableHead>
              <TableHead className="text-right">{t("columns.comments")}</TableHead>
              <TableHead className="text-right"><span className="sr-only">{t("columns.post")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.collaborationId}>
                <TableCell>
                  <span className="flex items-center gap-2"><PersonAvatar name={p.creator} src={p.avatarUrl} size="sm" />
                    <span className="min-w-0"><span className="block font-medium">{p.creator}</span><span className="block text-caption text-ink-muted">{p.campaign}</span></span>
                  </span>
                </TableCell>
                <TableCell className="num text-ink-muted">{p.publishedAt ? format.dateTime(new Date(p.publishedAt), { day: "numeric", month: "short", year: "numeric" }) : "—"}</TableCell>
                <TableCell><a href={p.trackedUrl} target="_blank" rel="noreferrer" className="num text-caption text-info hover:underline">{p.trackedUrl.replace(/^https?:\/\//, "")}</a></TableCell>
                <TableCell className="num text-right font-medium">{format.number(p.clicks)}</TableCell>
                <TableCell className="num text-right text-ink-muted">{format.number(p.avgReactions)}</TableCell>
                <TableCell className="num text-right text-ink-muted">{format.number(p.avgComments)}</TableCell>
                <TableCell className="text-right">
                  {p.postUrl ? <a href={p.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-small font-medium text-info hover:underline">{t("view")}<ExternalLink className="size-3" aria-hidden="true" /></a> : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
