import type { CSSProperties } from "react";

const DOTS = 8;
const TURN = 360;

// A small spray of dots for a success moment (accepted, withdrawn, paid).
// Keyed by the caller so it plays once per success; nothing under reduced motion.
export function Burst({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`}>
      {Array.from({ length: DOTS }, (_, i) => (
        <span key={i} className="g-burst absolute size-1.5 rounded-chip bg-money" style={{ "--g-angle": `${(TURN / DOTS) * i}deg` } as CSSProperties} />
      ))}
    </span>
  );
}
