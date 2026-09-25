// The mark's three dots joined by one line, as the assistant's state: still
// at rest, bouncing while it listens or is on a call, pulsing in sequence
// while it thinks. Transform and opacity only; still under reduced motion.
export function TrailDots({ state, className = "" }: { state: "idle" | "listening" | "thinking"; className?: string }) {
  return (
    <svg viewBox="0 0 28 12" data-state={state} className={`trail-dots h-3 w-7 shrink-0 text-ink ${className}`} aria-hidden="true">
      <path d="M3 9 L14 4 L25 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <circle cx="3" cy="9" r="2.4" fill="currentColor" />
      <circle cx="14" cy="4" r="2.4" fill="currentColor" />
      <circle cx="25" cy="7" r="2.4" fill="currentColor" />
    </svg>
  );
}
