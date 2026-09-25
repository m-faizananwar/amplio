import { Download } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PersonAvatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CreatorAttribution } from "../../server/queries";
import { Section } from "./Section";

// Per creator and campaign: clicks, then what the pixel saw after the click.
// Each row exports its own clicks, so a disputed number is one download away.
export async function AttributionByCreator({ rows, exportPath }: { rows: CreatorAttribution[]; exportPath: string }) {
  const t = await getTranslations("brand.results.attribution");
  const format = await getFormatter();
  return (
    <Section id="attribution-title" title={t("title")} description={t("description")} action={<a href={exportPath} className={buttonVariants({ variant: "secondary", size: "sm" })}><Download aria-hidden="true" />{t("exportAll")}</a>}>
      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule-strong bg-surface px-5 py-8 text-center text-body text-ink-muted">{t("empty")}</p>
      ) : (
        <Table framed>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.creator")}</TableHead>
              <TableHead>{t("columns.campaign")}</TableHead>
              <TableHead className="text-right">{t("columns.clicks")}</TableHead>
              <TableHead className="text-right">{t("columns.visits")}</TableHead>
              <TableHead className="text-right">{t("columns.signups")}</TableHead>
              <TableHead className="text-right">{t("columns.purchases")}</TableHead>
              <TableHead className="text-right"><span className="sr-only">{t("columns.export")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.creatorId}-${r.campaign}`}>
                <TableCell><span className="flex items-center gap-2"><PersonAvatar name={r.name} src={r.avatarUrl} size="sm" /><span className="font-medium">{r.name}</span></span></TableCell>
                <TableCell className="text-ink-muted">{r.campaign}</TableCell>
                <TableCell className="num text-right font-medium">{format.number(r.clicks)}</TableCell>
                <TableCell className="num text-right">{format.number(r.visits)}</TableCell>
                <TableCell className="num text-right text-money">{format.number(r.signups)}</TableCell>
                <TableCell className="num text-right">{format.number(r.purchases)}</TableCell>
                <TableCell className="text-right"><a href={`${exportPath}?creator=${r.creatorId}`} className={buttonVariants({ variant: "ghost", size: "xs" })} aria-label={t("exportOne", { name: r.name })}>CSV</a></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
