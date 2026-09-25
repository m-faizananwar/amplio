import type { CSSProperties } from "react";
import { brandTrail } from "@/lib/brand-trail";
import { cn } from "@/lib/cn";
import { DrawOnPath } from "./DrawOnPath";

type Size = "sm" | "default" | "lg";

// Same footprint as PersonAvatar, but square-ish: a company, not a face.
const BOX: Record<Size, string> = { sm: "size-6", default: "size-8", lg: "size-10" };
const LINE_MS = 360;
const DOT_STAGGER_MS = 70;

// A brand without a logo: its trail (dots joined by a line, seeded by the
// name) on a tint tile. The line draws itself, then the dots land along it;
// reduced motion shows the finished mark. Decorative — the name sits beside it.
export function BrandMark({ name, size = "default", className }: { name: string; size?: Size; className?: string }) {
  const { points, d } = brandTrail(name);
  return (
    <span data-slot="brand-mark" className={cn("inline-flex shrink-0 items-center justify-center rounded-control border border-rule bg-tint text-ink", BOX[size], className)}>
      <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
        <DrawOnPath d={d} strokeWidth={1.4} duration={LINE_MS} className="opacity-60" />
        {points.map(([x, y], i) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="currentColor" className="g-dot" style={{ "--g-delay": `${LINE_MS / 2 + i * DOT_STAGGER_MS}ms` } as CSSProperties} />
        ))}
      </svg>
    </span>
  );
}
