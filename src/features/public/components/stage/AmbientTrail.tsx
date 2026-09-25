import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Stage } from "./Stage";

// A quiet trail for the margins (auth, legal headers): the mark's three dots
// join, then every few seconds a click travels the line and the last dot
// answers green. Loops only while on screen.
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function AmbientTrail({ className }: { className?: string }) {
  return (
    <Stage loop className={cn("text-ink", className)}>
      <svg viewBox="0 0 220 160" className="w-full" aria-hidden="true">
        <path d="M20 130 L100 96 L200 24" pathLength={1} className="st-draw" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round" style={v({ "--dur": "900ms" })} />
        {[[20, 130], [100, 96], [200, 24]].map(([x, y], i) => (
          <circle key={x} cx={x} cy={y} r="7" fill="currentColor" className="st-pop" style={v({ "--d": `${i * 220}ms` })} />
        ))}
        <circle cx="20" cy="130" r="4" fill="var(--color-money)" className="st-travel" style={v({ "--dx": "80px", "--dy": "-34px", "--d": "1400ms", "--dur": "2600ms" })} />
        <circle cx="100" cy="96" r="4" fill="var(--color-money)" className="st-travel" style={v({ "--dx": "100px", "--dy": "-72px", "--d": "2700ms", "--dur": "2600ms" })} />
        <circle cx="200" cy="24" r="11" fill="none" stroke="var(--color-money)" strokeWidth="2" className="st-pulse" style={v({ "--d": "3800ms" })} />
      </svg>
    </Stage>
  );
}
