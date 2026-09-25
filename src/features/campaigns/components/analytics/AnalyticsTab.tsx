import { ExternalLink } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PersonAvatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnalyticsDto } from "../../schemas";
import { ClicksChart } from "./ClicksChart";

const CENTS = 100;

// Results for one campaign: three numbers, clicks per day, and the rows they
// come from — per creator and per live post.
export async function AnalyticsTab({ analytics: a }: { analytics: AnalyticsDto }) {
  const t = await getTranslations("brand.campaigns.analytics");
  const format = await getFormatter();
  const empty = (text: string) => <p className="rounded-card border border-dashed border-rule-strong bg-surface px-5 py-8 text-center text-body text-ink-muted">{text}</p>;
  return (
    <div className="grid gap-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("reach.label")} value={a.estReach} hint={a.publishedPosts === 0 ? t("reach.none") : t("reach.hint", { count: a.publishedPosts })} />
        <StatCard label={t("clicks.label")} value={a.qualifiedClicks} hint={t("clicks.hint")} />
        <StatCard label={t("committed.label")} value={a.committedCents} tone="money" format={(c) => format.number(c / CENTS, { style: "currency", currency: "EUR" })} hint={t("committed.hint", { count: a.bookings })} />
      </div>
      <section className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3"><h2 className="text-h4">{t("chart.title")}</h2><span className="text-caption text-ink-muted">{t("chart.window")}</span></div>
        {a.daily.some((d) => d.clicks > 0) ? <div className="rounded-card border border-rule bg-surface p-4"><ClicksChart data={a.daily} /></div> : empty(t("chart.empty"))}
      </section>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
        <section className="grid gap-3 content-start">
          <h2 className="text-h4">{t("byCreator.title")}</h2>
          {a.byCreator.length === 0 ? empty(t("byCreator.empty")) : (
            <Table framed>
              <TableHeader><TableRow><TableHead>{t("byCreator.creator")}</TableHead><TableHead className="text-right">{t("byCreator.clicks")}</TableHead></TableRow></TableHeader>
              <TableBody>
                {a.byCreator.map((r) => (
                  <TableRow key={r.creatorId}>
                    <TableCell><span className="flex items-center gap-2"><PersonAvatar name={r.creatorName} src={r.avatarUrl} size="sm" />{r.creatorName}</span></TableCell>
                    <TableCell className="num text-right">{format.number(r.clicks)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
        <section className="grid gap-3 content-start">
          <h2 className="text-h4">{t("posts.title")}</h2>
          {a.posts.length === 0 ? empty(t("posts.empty")) : (
            <ul className="divide-y divide-rule rounded-card border border-rule bg-surface">
              {a.posts.map((p) => (
                <li key={p.collaborationId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.creatorName}</span>
                    <span className="num block text-caption text-ink-muted">{format.dateTime(new Date(p.publishedAt), { day: "numeric", month: "short", year: "numeric" })} · {t("posts.clicks", { count: p.clicks })}</span>
                  </span>
                  <a href={p.postUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-small text-info hover:underline">{t("posts.view")}<ExternalLink className="size-3" aria-hidden="true" /></a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
