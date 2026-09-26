import type { ReactNode } from "react";

type Name = "people" | "grid" | "chevron" | "play";

const PATHS: Record<Name, { box: string; draw: ReactNode }> = {
  people: {
    box: "0 0 21.3 22.4",
    draw: (
      <>
        <circle cx="8" cy="7" r="3.6" />
        <path d="M1.6 19.6c.6-3.6 3.2-5.8 6.4-5.8s5.8 2.2 6.4 5.8" />
        <path d="M14.2 3.8a3.3 3.3 0 0 1 0 6.4M16.6 13.9c1.9.8 3 2.7 3.3 5.2" />
      </>
    ),
  },
  grid: {
    box: "0 0 20.2 20.2",
    draw: (
      <>
        <rect x="1.4" y="1.4" width="7" height="7" rx="1.7" />
        <rect x="11.8" y="1.4" width="7" height="7" rx="1.7" />
        <rect x="1.4" y="11.8" width="7" height="7" rx="1.7" />
        <rect x="11.8" y="11.8" width="7" height="7" rx="1.7" />
      </>
    ),
  },
  chevron: { box: "0 0 18 18", draw: <path d="m6.6 3.6 6 5.4-6 5.4" /> },
  play: { box: "0 0 16 16", draw: <path d="M4.5 2.6v10.8L13 8z" fill="currentColor" /> },
};

// The glass hero's line icons, one stroke weight (1.7; the chevron 1.9).
export function GlassIcon({ name, className }: { name: Name; className?: string }) {
  const { box, draw } = PATHS[name];
  return (
    <svg viewBox={box} className={className} fill="none" stroke="currentColor" strokeWidth={name === "chevron" ? 1.9 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {draw}
    </svg>
  );
}
