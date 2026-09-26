// The copy icon as two pages. When something is copied (`copied` changes to a
// new truthy value) the back page slides onto the front one, they read as one
// sheet, and a check draws in on it. currentColor, stroke only.
export function CopyGlyph({ copied, className = "size-4" }: { copied: number; className?: string }) {
  return (
    <svg key={copied} viewBox="0 0 24 24" className={`g-copy ${className}`} data-copied={copied > 0 || undefined} aria-hidden="true">
      <rect className="g-copy-back" x="4" y="4" width="11" height="11" rx="2.5" />
      <rect className="g-copy-front" x="9" y="9" width="11" height="11" rx="2.5" />
      <path className="g-copy-check" d="M11.8 14.6l1.9 1.9 3.6-4" />
    </svg>
  );
}
