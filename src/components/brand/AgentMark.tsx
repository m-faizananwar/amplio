import type { SVGProps } from "react";
import { cn } from "@/lib/cn";
import { MARK_POINTS } from "./BrandMark";

// Agentic mode's icon: the mark itself, with its three dots taking a breath one
// after another (post → click → lead), so the nav item reads as the product's
// own agent rather than a generic sparkle. Sized by its container like a
// lucide icon; still under reduced motion (styles/shell.css, .agent-mark).
export function AgentMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  const [a, b, c] = MARK_POINTS;
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} className={cn("agent-mark", className)}>
      <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}`} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {MARK_POINTS.map(([x, y], i) => (
        <circle key={x} cx={x} cy={y} r={2.8} fill="currentColor" style={{ animationDelay: `${i * 240}ms` }} />
      ))}
    </svg>
  );
}
