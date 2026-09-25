"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Stamp } from "@/components/graphics/Stamp";
import { StatusChip } from "@/components/ui/status-chip";
import { TableCell, TableRow } from "@/components/ui/table";
import type { LedgerRowDto } from "../../schemas";
import { ledgerDetail } from "./ledger-rows";

const CENTS = 100;

// One ledger movement. From 640px up: date, detail, status, amount; below
// that the row stacks, with the date moving under the detail, so the table
// fits a phone without scrolling sideways.
export function CreatorLedgerRow({ row: r }: { row: LedgerRowDto }) {
  const t = useTranslations("creator.earnings.ledger");
  const ts = useTranslations("collaboration.status");
  const tm = useTranslations("creator.earnings.withdraw.method");
  const format = useFormatter();
  const date = format.dateTime(new Date(r.date), { dateStyle: "medium" });
  const status = r.status === "completed" ? t("statuses.completed") : r.type === "withdrawal" ? t("statuses.inTransit") : t("statuses.pending");
  return (
    <TableRow>
      <TableCell className="num hidden text-small text-ink-muted sm:table-cell">{date}</TableCell>
      <TableCell className="whitespace-normal">
        <span className="block text-ink">{ledgerDetail(r, { bank: tm("bank"), stripe: tm("stripe") })}</span>
        <span className="num block text-caption text-ink-muted"><span className="sm:hidden">{date} · </span>{t(`types.${r.type}`)} · {r.reference}</span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{r.type === "payout" && r.status === "completed" ? <Stamp>{ts("paid")}</Stamp> : <StatusChip tone={r.status === "completed" ? "money" : "attention"}>{status}</StatusChip>}</TableCell>
      <TableCell className={`num text-right ${r.amountCents >= 0 ? "text-money" : "text-ink"}`}>{format.number(r.amountCents / CENTS, { style: "currency", currency: "EUR", signDisplay: "exceptZero" })}</TableCell>
    </TableRow>
  );
}
