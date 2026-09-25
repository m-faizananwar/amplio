import type { CSSProperties } from "react";

const FULL = 100;

// The fit score's ring: it closes around the percentage once, after the
// signal bars have filled (delayed). Dashoffset only; full at rest under
// reduced motion.
export function FitRing({ score, delay = 300, className = "size-4" }: { score: number; delay?: number; className?: string }) {
  const to = FULL - Math.max(0, Math.min(FULL, score));
  return (
    <svg viewBox="0 0 20 20" className={`-rotate-90 ${className}`} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength={FULL} strokeDasharray={FULL}
        className="g-ring" style={{ "--g-to": to, "--g-delay": `${delay}ms`, strokeDashoffset: to } as CSSProperties} />
    </svg>
  );
}
