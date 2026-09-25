"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableEmpty } from "@/components/ui/table-parts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedgerRowDto } from "../../schemas";
import { ledgerFilter, type LedgerView } from "./ledger-rows";
import { CreatorLedgerRow } from "./CreatorLedgerRow";
import { PenLedgerScene } from "@/components/graphics/scenes";

const VIEWS: LedgerView[] = ["all", "awaiting", "payments"];

// Every movement, one row each: payments in, withdrawals out.
export function CreatorLedger({ rows }: { rows: LedgerRowDto[] }) {
  const t = useTranslations("creator.earnings.ledger");
  const [view, setView] = useState<LedgerView>("all");
  const visible = ledgerFilter(rows, view);
  return (
    // minmax(0,1fr): the column is the viewport's width, never the width of a
    // long (French) tab strip or the table
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-h4">{t("title")}</h2><p className="text-small text-ink-muted">{t("description")}</p></div>
        <Tabs value={view} onValueChange={(v) => setView(v as LedgerView)}>
          <TabsList variant="pill" aria-label={t("title")} className="max-w-full overflow-x-auto">{VIEWS.map((v) => <TabsTrigger key={v} value={v}>{t(`tabs.${v}`)}</TabsTrigger>)}</TabsList>
        </Tabs>
      </div>
      <Table framed key={view}>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">{t("headers.date")}</TableHead>
            <TableHead>{t("headers.detail")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("headers.status")}</TableHead>
            <TableHead className="text-right">{t("headers.amount")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? <TableEmpty colSpan={4}><span className="grid justify-items-center gap-2"><PenLedgerScene />{t(`empty.${view}`)}</span></TableEmpty> : visible.map((r) => (
            <CreatorLedgerRow key={r.id} row={r} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
