// The only loader in the app: the mark's three dots joined by one line,
// pulsing in sequence. Announced once as "loading" for assistive tech.
export function TrailLoader({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <span role={label ? "status" : undefined} aria-label={label} className={`inline-flex items-center ${className}`}>
      <svg viewBox="0 0 28 12" className="g-trail h-3 w-7 text-ink" aria-hidden="true">
        <path d="M3 9 L14 4 L25 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
        <circle cx="3" cy="9" r="2.4" fill="currentColor" />
        <circle cx="14" cy="4" r="2.4" fill="currentColor" />
        <circle cx="25" cy="7" r="2.4" fill="currentColor" />
      </svg>
    </span>
  );
}
