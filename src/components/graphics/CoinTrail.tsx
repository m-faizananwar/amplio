// Money leaving a balance: a line draws out of it and a coin runs along it
// and off the edge. Keyed by the caller so it plays once per withdrawal;
// nothing under reduced motion. Sits inside a relative parent.
export function CoinTrail({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-x-5 top-1/2 h-3 -translate-y-1/2 ${className}`}>
      <span className="g-coin-line absolute inset-x-0 top-1/2 h-px origin-left bg-money" />
      {/* the runner is as wide as the track, so translateX(100%) lands the coin at the far end */}
      <span className="g-coin-run absolute inset-0">
        <span className="absolute left-0 top-0 size-3 rounded-chip bg-money ring-2 ring-surface" />
      </span>
    </span>
  );
}
