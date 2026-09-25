import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CollaborationDto, ViewerRole } from "../../schemas";
import { CollaborationRow } from "./CollaborationRow";

type Props = { rows: CollaborationDto[]; role: ViewerRole; emptyMessage: string };

const CREATOR_COLUMNS = ["Brand", "Campaign", "Status", "Performance", "Next action", "Due date", "Your net"];
const BRAND_COLUMNS = ["Creator", "Campaign", "Status", "Next action", "Due date", "Amount", "Updated"];

export function CollaborationsTable({ rows, role, emptyMessage }: Props) {
  const columns = role === "creator" ? CREATOR_COLUMNS : BRAND_COLUMNS;
  const amountIndex = role === "creator" ? columns.length - 1 : columns.length - 2;
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col, i) => (
            <TableHead key={col} className={i === amountIndex ? "text-right" : undefined}>
              {col}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody key={rows.map((r) => r.id).join(",")}>
        {rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => <CollaborationRow key={row.id} row={row} role={role} />)
        )}
      </TableBody>
    </Table>
  );
}
