import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCents } from "@/lib/money";
import type { LedgerRowDto } from "../schemas";

const TYPE_LABEL: Record<LedgerRowDto["type"], string> = {
  topup: "Top-up",
  booking: "Booking",
  payout: "Payout",
  withdrawal: "Withdrawal",
};

export function LedgerTable({ rows, emptyText }: { rows: LedgerRowDto[]; emptyText: string }) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody key={rows.map((r) => r.id).join(",")}>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{r.date.slice(0, "YYYY-MM-DD".length)}</TableCell>
              <TableCell className="font-mono text-xs">{r.reference}</TableCell>
              <TableCell>{TYPE_LABEL[r.type]}</TableCell>
              <TableCell className="text-muted-foreground">{r.description}</TableCell>
              <TableCell className={r.amountCents < 0 ? "text-right" : "text-right font-medium text-emerald-700"}>
                {r.amountCents > 0 ? "+" : ""}
                {formatCents(r.amountCents, "EUR")}
              </TableCell>
              <TableCell>
                <Badge variant={r.status === "completed" ? "secondary" : "outline"}>{r.status === "completed" ? "Completed" : "Pending"}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
