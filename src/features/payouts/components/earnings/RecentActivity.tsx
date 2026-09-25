import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LedgerRowDto } from "../../schemas";
import { LedgerTable } from "../LedgerTable";

export function RecentActivity({ rows }: { rows: LedgerRowDto[] }) {
  const movements = rows.filter((r) => r.status === "completed");
  const awaiting = rows.filter((r) => r.type === "payout" && r.status === "pending");
  return (
    <section className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold">Recent activity</h2>
      <p className="text-sm text-muted-foreground">Collaboration earnings, withdrawals and invoices in one place.</p>
      <Tabs defaultValue="movements" className="mt-4">
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="movements">Earnings and withdrawals</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting release · {awaiting.length}</TabsTrigger>
          <TabsTrigger value="invoices">Invoices · {movements.filter((r) => r.type === "payout").length}</TabsTrigger>
        </TabsList>
        <TabsContent value="movements">
          <LedgerTable rows={movements} emptyText="No movements yet. Your first payment will appear here." />
        </TabsContent>
        <TabsContent value="awaiting">
          <LedgerTable rows={awaiting} emptyText="Nothing is waiting for release." />
        </TabsContent>
        <TabsContent value="invoices">
          <LedgerTable rows={movements.filter((r) => r.type === "payout")} emptyText="Invoices are issued per paid collaboration." />
        </TabsContent>
      </Tabs>
    </section>
  );
}
