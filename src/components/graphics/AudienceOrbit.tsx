import type { CSSProperties, ReactNode } from "react";

type Props = { followers: number; topTitles: string[]; children: ReactNode };

const MIN_DOTS = 5;
const MAX_DOTS = 18;
const TURN = 360;
const DOTS_PER_DECADE = 3.5;

// The avatar in an orbit of audience dots — more dots for a bigger audience
// (log scale, so a 100k account isn't a blur). Hovering the avatar floats
// the top audience titles out as chips. The orbit turns slowly (ambient) and
// stands still under reduced motion.
export function AudienceOrbit({ followers, topTitles, children }: Props) {
  const dots = Math.max(MIN_DOTS, Math.min(MAX_DOTS, Math.round(Math.log10(Math.max(10, followers)) * DOTS_PER_DECADE)));
  return (
    <div className="group/orbit relative grid size-20 shrink-0 place-items-center">
      <span aria-hidden="true" className="g-orbit absolute inset-0">
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className="absolute top-1/2 left-1/2 size-1 rounded-chip bg-ink-muted" style={{ transform: `rotate(${(TURN / dots) * i}deg) translateX(38px)` } as CSSProperties} />
        ))}
      </span>
      <span className="relative">{children}</span>
      {topTitles.length > 0 ? (
        <span aria-hidden="true" className="pointer-events-none absolute top-full left-0 z-10 mt-1 flex gap-1 opacity-0 transition-[opacity,transform] duration-(--duration-base) ease-ledger group-hover/orbit:translate-y-1 group-hover/orbit:opacity-100">
          {topTitles.map((title) => <span key={title} className="rounded-chip border border-rule bg-surface px-2 py-0.5 text-caption whitespace-nowrap text-ink shadow-float">{title}</span>)}
        </span>
      ) : null}
    </div>
  );
}
