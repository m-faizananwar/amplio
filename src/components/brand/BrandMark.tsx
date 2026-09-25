import { cn } from "cn";

// The mark: three dots joined by one line — post → click → lead, the trail
// every number in the product is made of (docs/design/DIRECTION.md, "Mark").
// Drawn in currentColor so it takes the ink of wherever it sits. Below 20px the
// line and dots get heavier so the trail survives at tab size.
export const MARK_POINTS = [
  [3.5, 18.5],
  [11.5, 15],
  [20.5, 5],
] as const;

export function BrandMark({ size = 24, className }: { size?: number; className?: string }) {
  const small = size < 20;
  const [a, b, c] = MARK_POINTS;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}`} stroke="currentColor" strokeWidth={small ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
      {MARK_POINTS.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={small ? 2.8 : 2.5} fill="currentColor" />
      ))}
    </svg>
  );
}
