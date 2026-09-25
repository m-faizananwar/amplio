import { Download } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BrandTrail } from "../../server/trail-queries";
import { Section } from "./Section";

const SHOWN = 25;

// The raw ledger of clicks, newest first: when, whose link, from where, on
// what. The first rows are here; the CSV has every one.
export async function ClickLog({ trail, exportPath }: { trail: BrandTrail; exportPath: string }) {
  const t = await getTranslations("brand.results.log");
  const tt = await getTranslations("brand.trail");
  const format = await getFormatter();
  const rows = trail.rows.slice(0, SHOWN);
  return (
    <Section id="log-title" title={t("title")} description={t("description", { shown: rows.length, count: trail.total })} action={<a href={exportPath} className={buttonVariants({ variant: "secondary", size: "sm" })}><Download aria-hidden="true" />{t("export")}</a>}>
      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule-strong bg-surface px-5 py-8 text-center text-body text-ink-muted">{tt("empty.clicks")}</p>
      ) : (
        <Table framed containerClassName="max-h-[28rem] overflow-y-auto">
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.time")}</TableHead>
              <TableHead>{t("columns.creator")}</TableHead>
              <TableHead>{t("columns.source")}</TableHead>
              <TableHead>{t("columns.device")}</TableHead>
              <TableHead>{t("columns.country")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="num text-caption text-ink-muted">{format.dateTime(new Date(r.at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                <TableCell><span className="block font-medium">{r.creator}</span><span className="block text-caption text-ink-muted">{r.campaign}</span></TableCell>
                <TableCell className="text-ink-muted">{r.referrerHost ?? tt("direct")}</TableCell>
                <TableCell className="text-ink-muted">{r.device ? tt(`device.${r.device}`) : "—"}</TableCell>
                <TableCell className="num text-ink-muted">{r.country ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
