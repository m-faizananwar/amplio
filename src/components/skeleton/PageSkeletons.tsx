import { Bone } from "./Bone";

// Page-shaped skeletons for the brand side: the same cards, in the same
// places and sizes as the page they stand in for, so nothing jumps when it
// lands. RouteSkeleton picks one by path.

const CARD = "rounded-card border border-rule bg-surface shadow-lift";

function StatRow({ count }: { count: number }) {
  return (
    <div className={count === 3 ? "grid gap-4 md:grid-cols-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${CARD} grid h-40 content-start gap-3 p-5`}>
          <Bone className="h-3 w-28" /><Bone className="h-9 w-24" /><Bone className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

function Rows({ count, className = "" }: { count: number; className?: string }) {
  return (
    <div className={`${CARD} divide-y divide-rule overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex h-[71px] items-center gap-3 px-5">
          <Bone className="size-8 rounded-full" />
          <div className="grid flex-1 gap-2"><Bone className="h-3.5 w-2/5" /><Bone className="h-3 w-1/4" /></div>
          <Bone className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="grid gap-10">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-4"><Bone className="h-6 w-28" /><Rows count={4} /></div>
        <div className={`${CARD} grid justify-items-center gap-5 p-5 lg:mt-11`}>
          <Bone className="size-48 rounded-full" />
          <div className="grid w-full gap-2">{Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-7 w-full" />)}</div>
        </div>
      </div>
      <StatRow count={3} />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="grid gap-8">
      <StatRow count={4} />
      <div className={`${CARD} grid gap-4 p-5`}><Bone className="h-5 w-40" /><Bone className="h-64 w-full" /><Bone className="h-10 w-full" /></div>
      <Rows count={4} />
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="grid gap-8">
      <div className={`${CARD} grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center`}>
        <div className="grid gap-3"><Bone className="h-3 w-20" /><Bone className="h-12 w-56" /><Bone className="h-3 w-40" /><Bone className="h-11 w-36 rounded-full" /></div>
        <div className="grid gap-px overflow-hidden rounded-control sm:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <Bone key={i} className="h-24 rounded-none" />)}</div>
      </div>
      <Rows count={6} />
    </div>
  );
}

export function ListCardSkeleton({ toolbar = false }: { toolbar?: boolean }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      {toolbar ? <div className="grid gap-3 border-b border-rule p-4"><Bone className="h-9 w-64" /><Bone className="h-11 w-full" /></div> : null}
      <div className="divide-y divide-rule">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex h-[87px] items-center gap-3 px-5">
            <Bone className="size-8 rounded-full" />
            <div className="grid flex-1 gap-2"><Bone className="h-3.5 w-1/3" /><Bone className="h-3 w-1/2" /></div>
            <Bone className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
