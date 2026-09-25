import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/collaboration-labels";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TrackedLinkPerformance } from "../../server/creator-queries";

import { BRAND } from "@/config/brand";
export function TrackedLinksTable({ rows }: { rows: TrackedLinkPerformance[] }) {
  return (
    <section className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold">Tracked link performance</h2>
      <p className="text-sm text-muted-foreground">Clicks on the {BRAND.wordmark} link in each sponsored post. Real time, one row per click.</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">No tracked links yet — they are created when a booking is accepted.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody key={rows.length}>
              {rows.map((r) => (
                <TableRow key={r.collaborationId}>
                  <TableCell className="font-medium">{r.brand}</TableCell>
                  <TableCell className="text-muted-foreground">{r.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABELS[r.status as CollaborationStatus] ?? r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/r/${r.code}`} className="font-mono text-xs text-brand hover:underline" target="_blank">
                      /r/{r.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">{r.clicks.toLocaleString("en-US")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
