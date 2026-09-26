import { cn } from "@/lib/cn";

// The empty picture: a drawn silhouette in the accent tint, so a missing photo
// reads as a gap to fill rather than as someone's initials. `logo` draws an
// image placeholder (a sun over a hill) instead of a person.
export function Silhouette({ kind = "person", className }: { kind?: "person" | "logo"; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-full", className)} aria-hidden="true" focusable="false">
      <rect width="64" height="64" style={{ fill: "color-mix(in oklab, var(--color-money) 12%, var(--color-surface))" }} />
      {kind === "person" ? (
        <g style={{ fill: "color-mix(in oklab, var(--color-money) 42%, var(--color-surface))" }}>
          <circle cx="32" cy="25" r="11" />
          <path d="M11 60c1.8-11.4 10.4-18.5 21-18.5S51.2 48.6 53 60z" />
        </g>
      ) : (
        <g style={{ fill: "color-mix(in oklab, var(--color-money) 42%, var(--color-surface))" }}>
          <circle cx="41" cy="22" r="6" />
          <path d="M8 50 24 31l10 11 6-6 16 14z" />
        </g>
      )}
    </svg>
  );
}
