import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedgerRowDto } from "../../schemas";
import { LedgerTable } from "../LedgerTable";

export function InvoicesTabs({ rows }: { rows: LedgerRowDto[] }) {
  const topups = rows.filter((r) => r.type === "topup");
  const bookings = rows.filter((r) => r.type === "booking");
  return (
    <section className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold">Invoices</h2>
      <p className="text-sm text-muted-foreground">Every top-up and booking, with its reference.</p>
      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="all">All · {rows.length}</TabsTrigger>
          <TabsTrigger value="topups">Top-ups · {topups.length}</TabsTrigger>
          <TabsTrigger value="bookings">Bookings · {bookings.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <LedgerTable rows={rows} emptyText="No invoices or entries yet." />
        </TabsContent>
        <TabsContent value="topups">
          <LedgerTable rows={topups} emptyText="No top-ups yet." />
        </TabsContent>
        <TabsContent value="bookings">
          <LedgerTable rows={bookings} emptyText="No bookings yet." />
        </TabsContent>
      </Tabs>
    </section>
  );
}
