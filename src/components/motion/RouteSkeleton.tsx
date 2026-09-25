import { TrailLoader } from "@/components/graphics/TrailLoader";
import { PageHeaderSkeleton } from "@/components/skeleton/PageHeaderSkeleton";
import { StatTilesSkeleton, TableSkeleton } from "@/components/skeleton/Skeletons";

// One skeleton for every app route. It is shown in two places only: the first
// paint of a cold load (the layout's Suspense fallback, so the shell streams
// before the data lands) and a client navigation that has run long enough to
// look stuck. The header/tiles/rows rhythm is what every /brand and /creator
// page opens with, so the real page lands on top of the same boxes.
export function RouteSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* the app's one loader, above the boxes the page will land on */}
      <TrailLoader className="mb-4" />
      <PageHeaderSkeleton withActions />
      <div className="mt-8"><StatTilesSkeleton /></div>
      <div className="mt-6"><TableSkeleton columns={4} rows={5} /></div>
    </div>
  );
}
