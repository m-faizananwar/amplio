import { PageHeaderSkeleton } from "@/components/skeleton/PageHeaderSkeleton";
import { BillingSkeleton, ListCardSkeleton, OverviewSkeleton, ResultsSkeleton } from "@/components/skeleton/PageSkeletons";
import { StatTilesSkeleton, TableSkeleton } from "@/components/skeleton/Skeletons";

// The skeleton for a route, shown on a cold load (the layout's Suspense
// fallback) and when a client navigation runs long enough to look stuck.
// The brand and creator pages get their own shape — the same cards in the same places —
// so the real page lands on top of it without anything jumping; any other
// route gets the header / tiles / rows rhythm most pages open with.
function Body({ pathname }: { pathname: string }) {
  switch (pathname) {
    case "/brand": return <OverviewSkeleton />;
    case "/brand/results": return <ResultsSkeleton />;
    case "/brand/billing": return <BillingSkeleton />;
    case "/brand/creators": return <ListCardSkeleton toolbar />;
    case "/brand/campaigns":
    case "/brand/collaborations": return <ListCardSkeleton />;
    // creator pages share the brand shapes: Overview (Needs you + ring + three
    // numbers), Earnings (one balance card + ledger rows, like Billing),
    // Analytics (a chart card + the links table), the filtered lists
    case "/creator": return <OverviewSkeleton />;
    case "/creator/earnings": return <BillingSkeleton />;
    case "/creator/analytics": return <ResultsSkeleton />;
    case "/creator/opportunities": return <ListCardSkeleton toolbar />;
    case "/creator/collaborations": return <ListCardSkeleton />;
    default:
      return (
        <>
          <div className="mt-8"><StatTilesSkeleton /></div>
          <div className="mt-6"><TableSkeleton columns={4} rows={5} /></div>
        </>
      );
  }
}

export function RouteSkeleton({ pathname = "" }: { pathname?: string }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-8">
      <PageHeaderSkeleton withActions />
      <Body pathname={pathname} />
    </div>
  );
}
