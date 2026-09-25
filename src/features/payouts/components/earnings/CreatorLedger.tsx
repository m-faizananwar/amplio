"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { StatusChip } from "@/components/ui/status-chip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableEmpty } from "@/components/ui/table-parts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedgerRowDto } from "../../schemas";
import { ledgerDetail, ledgerFilter, type LedgerView } from "./ledger-rows";
import { Stamp } from "@/components/graphics/Stamp";
import { PenLedgerScene } from "@/components/graphics/scenes";

const CENTS = 100;
const VIEWS: LedgerView[] = ["all", "awaiting", "payments"];

// Every movement, one row each: payments in, withdrawals out.
export function CreatorLedger({ rows }: { rows: LedgerRowDto[] }) {
  const t = useTranslations("creator.earnings.ledger");
  const ts = useTranslations("collaboration.status");
  const format = useFormatter();
  const [view, setView] = useState<LedgerView>("all");
  const visible = ledgerFilter(rows, view);
  const status = (r: LedgerRowDto) => (r.status === "completed" ? t("statuses.completed") : r.type === "withdrawal" ? t("statuses.inTransit") : t("statuses.pending"));
  return (
    <section className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-h4">{t("title")}</h2><p className="text-small text-ink-muted">{t("description")}</p></div>
        <Tabs value={view} onValueChange={(v) => setView(v as LedgerView)}>
          <TabsList variant="pill">{VIEWS.map((v) => <TabsTrigger key={v} value={v}>{t(`tabs.${v}`)}</TabsTrigger>)}</TabsList>
        </Tabs>
      </div>
      <Table framed key={view}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("headers.date")}</TableHead>
            <TableHead>{t("headers.detail")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("headers.status")}</TableHead>
            <TableHead className="text-right">{t("headers.amount")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? <TableEmpty colSpan={4}><span className="grid justify-items-center gap-2"><PenLedgerScene />{t(`empty.${view}`)}</span></TableEmpty> : visible.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="num text-small text-ink-muted">{format.dateTime(new Date(r.date), { dateStyle: "medium" })}</TableCell>
              <TableCell><span className="block text-ink">{ledgerDetail(r)}</span><span className="num block text-caption text-ink-muted">{t(`types.${r.type}`)} · {r.reference}</span></TableCell>
              <TableCell className="hidden sm:table-cell">{r.type === "payout" && r.status === "completed" ? <Stamp>{ts("paid")}</Stamp> : <StatusChip tone={r.status === "completed" ? "money" : "attention"}>{status(r)}</StatusChip>}</TableCell>
              <TableCell className={`num text-right ${r.amountCents >= 0 ? "text-money" : "text-ink"}`}>{format.number(r.amountCents / CENTS, { style: "currency", currency: "EUR", signDisplay: "exceptZero" })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
