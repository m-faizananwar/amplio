// Amplio's mark (three dots joined by one line: post → click → sign-up).
// `ring` sets it in a 40-unit box inside the 1.1 stroke circle that makes it a
// badge; without it the mark fills its box.
export function AmplioMark({ ring = false, className }: { ring?: boolean; className?: string }) {
  return (
    <svg viewBox={ring ? "0 0 40 40" : "0 0 24 24"} className={className} fill="none" aria-hidden="true" focusable="false">
      {ring ? <circle cx="20" cy="20" r="18.4" stroke="currentColor" strokeWidth="1.1" /> : null}
      <g transform={ring ? "translate(8.5 8.5) scale(0.96)" : undefined}>
        <path d="M3.5 18.5L11.5 15L20.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3.5" cy="18.5" r="2.5" fill="currentColor" />
        <circle cx="11.5" cy="15" r="2.5" fill="currentColor" />
        <circle cx="20.5" cy="5" r="2.5" fill="currentColor" />
      </g>
    </svg>
  );
}
