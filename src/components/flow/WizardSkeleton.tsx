import { Skeleton } from "@/components/ui/skeleton";
import s from "./wizard.module.css";

// A wizard step while it loads: the rail, the aside's lines and fields, and
// the preview card's outline (above the fields on phones, as the step is).
export function WizardSkeleton() {
  return (
    <div className={s.shell} aria-busy="true" aria-label="Loading">
      <div className={s.top}><Skeleton className="h-7 w-28" /><Skeleton className="h-7 w-16" /></div>
      <div className={s.main}>
        <div className={s.rail}><Skeleton className="h-4 w-full" /></div>
        <div className={s.grid}>
          <div className={`${s.head} grid gap-3`}><Skeleton className="h-3 w-40" /><Skeleton className="h-9 w-2/3" /><Skeleton className="h-4 w-full" /></div>
          <div data-area="card"><Skeleton className="h-80 w-full rounded-[34px] lg:h-[26rem] lg:rounded-[42px]" /></div>
          <div data-area="fields" className="grid content-start gap-5"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-1/2" /></div>
        </div>
      </div>
    </div>
  );
}
