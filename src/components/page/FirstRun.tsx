import type { ReactNode } from "react";
import { Bone } from "@/components/skeleton/Bone";

type Props = { title: string; body: string; action?: ReactNode };

const EXAMPLES = 6;

// First run of a list (no campaigns, collaborations, opportunities or
// messages yet): a masked row of example cards drifting slowly behind one
// raised card, the shape of what will be here, then what to do about it.
// Decorative above the text; still under reduced motion.
export function FirstRun({ title, body, action }: Props) {
  const card = (i: number) => (
    <div key={i} className="first-run-example">
      <Bone className="size-8 rounded-full" /><Bone className="h-3 w-24" /><Bone className="h-3 w-16" />
    </div>
  );
  return (
    <section className="grid justify-items-center gap-4 rounded-card border border-rule bg-surface px-6 pt-8 pb-10 text-center shadow-lift">
      <div className="first-run-stage" aria-hidden="true">
        <div className="first-run-track">{Array.from({ length: EXAMPLES * 2 }, (_, i) => card(i))}</div>
        <div className="first-run-raised">
          <Bone className="size-10 rounded-full" />
          <div className="grid flex-1 gap-2"><Bone className="h-3.5 w-3/4" /><Bone className="h-3 w-1/2" /></div>
          <Bone className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <h2 className="text-h4">{title}</h2>
      <p className="max-w-md text-body text-ink-muted">{body}</p>
      {action}
    </section>
  );
}
