"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedgerRowDto } from "../../schemas";

const CENTS = 100;
type Filter = "all" | "topup" | "booking";
const FILTERS: Filter[] = ["all", "booking", "topup"];

// The wallet's ledger: every euro in or out is a row with a reference. A
// booking stays "held" until it is paid; a top-up is credited at once.
export function LedgerRows({ rows }: { rows: LedgerRowDto[] }) {
  const t = useTranslations("brand.billing.ledger");
  const format = useFormatter();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.type === filter)), [rows, filter]);
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", signDisplay: "exceptZero" });
  const chip = (r: LedgerRowDto) =>
    r.status === "pending"
      ? <StatusChip tone="attention">{t("status.held")}</StatusChip>
      : <StatusChip tone={r.type === "topup" ? "neutral" : "money"}>{t(r.type === "topup" ? "status.credited" : "status.paid")}</StatusChip>;
  return (
    <section aria-labelledby="ledger-title" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ledger-title" className="text-h4">{t("title")}</h2>
          <p className="mt-1 text-small text-ink-muted">{t("description")}</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList variant="pill" aria-label={t("filter")}>
            {FILTERS.map((f) => <TabsTrigger key={f} value={f}>{t(`filters.${f}`)}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      {visible.length === 0 ? (
        <EmptyState size="compact" title={t("empty.title")} body={t("empty.body")} />
      ) : (
        <Table framed>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.date")}</TableHead>
              <TableHead>{t("columns.description")}</TableHead>
              <TableHead>{t("columns.reference")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="text-right">{t("columns.amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody key={filter} className="list-stagger">
            {visible.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="num text-caption text-ink-muted">{format.dateTime(new Date(r.date), { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell className="num text-caption text-ink-muted">{r.reference}</TableCell>
                <TableCell>{chip(r)}</TableCell>
                <TableCell className={`num text-right ${r.amountCents > 0 ? "text-money" : "text-ink"}`}>{money(r.amountCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
