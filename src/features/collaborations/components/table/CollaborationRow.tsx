import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { brandNextAction, creatorNextAction } from "@/lib/collaboration-labels";
import { TimeAgo } from "@/components/TimeAgo";
import { formatDate } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import type { CollaborationDto, ViewerRole } from "../../schemas";
import { BrandMark } from "../BrandMark";
import { StatusBadge } from "./StatusBadge";

type Props = { row: CollaborationDto; role: ViewerRole };

function performance(row: CollaborationDto) {
  if (row.clicks === null) return "—";
  return `${row.clicks} click${row.clicks === 1 ? "" : "s"}`;
}

// One table row. The first cell carries a stretched link so the whole row
// opens the detail while staying a real, focusable anchor.
export function CollaborationRow({ row, role }: Props) {
  const href = `/${role}/collaborations/${row.id}`;
  const nextAction = (role === "creator" ? creatorNextAction : brandNextAction)(row);
  return (
    <TableRow className="relative cursor-pointer">
      <TableCell>
        {/* A list of 20 rows must not prefetch 20 detail pages; the row is one click away either way. */}
        <Link href={href} prefetch={false} className="flex items-center gap-3 font-medium after:absolute after:inset-0 after:content-['']">
          {role === "creator" ? (
            <>
              <BrandMark initial={row.brandInitial} name={row.brandCompany} size="sm" />
              {row.brandCompany}
            </>
          ) : (
            <>
              <Avatar>
                <AvatarImage src={row.creatorAvatarUrl} alt="" />
                <AvatarFallback>{row.creatorName.charAt(0)}</AvatarFallback>
              </Avatar>
              {row.creatorName}
            </>
          )}
        </Link>
      </TableCell>
      <TableCell className="max-w-56 truncate text-muted-foreground" title={row.campaignName}>
        {row.campaignName}
      </TableCell>
      <TableCell>
        <StatusBadge status={row.status} />
      </TableCell>
      {role === "creator" ? <TableCell className="text-muted-foreground">{performance(row)}</TableCell> : null}
      <TableCell className="max-w-64 truncate" title={nextAction}>
        {nextAction}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(row.dueDate)}</TableCell>
      <TableCell className="text-right font-medium tabular-nums">{formatCents(row.feeCents, "EUR")}</TableCell>
      {role === "brand" ? <TableCell className="text-muted-foreground"><TimeAgo iso={row.updatedAt} /></TableCell> : null}
    </TableRow>
  );
}
