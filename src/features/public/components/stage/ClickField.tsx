import type { CSSProperties } from "react";

// Scene 2: the audience as a field of dots. A few light up (they clicked)
// and fly toward the tracked link on the right, which pulses as each lands.
const COLS = 12;
const ROWS = 5;
const LINK = { x: 372, y: 70 };
const CLICKERS = [3, 17, 26, 38, 44, 51];
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function ClickField({ linkLabel }: { linkLabel: string }) {
  const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({ i, x: 18 + (i % COLS) * 24, y: 22 + Math.floor(i / COLS) * 24 }));
  return (
    <svg viewBox="0 0 420 140" className="w-full text-ink" aria-hidden="true">
      {dots.map((d) => <circle key={d.i} cx={d.x} cy={d.y} r="4" fill="currentColor" opacity={CLICKERS.includes(d.i) ? 0.5 : 0.15} />)}
      {CLICKERS.map((i, k) => {
        const d = dots[i];
        return (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="5" fill="var(--color-money)" className="st-pulse" style={v({ "--d": `${k * 120}ms` })} />
            <circle cx={d.x} cy={d.y} r="4" fill="var(--color-money)" className="st-fly-loop" style={v({ "--dx": `${LINK.x - 28 - d.x}px`, "--dy": `${LINK.y - d.y}px`, "--d": `${400 + k * 260}ms`, "--dur": "2400ms" })} />
          </g>
        );
      })}
      <g>
        <rect x={LINK.x - 34} y={LINK.y - 16} width="80" height="32" rx="8" fill="var(--color-paper)" stroke="currentColor" />
        <circle cx={LINK.x - 20} cy={LINK.y} r="4" fill="var(--color-money)" className="st-pulse" />
        <text x={LINK.x - 10} y={LINK.y + 4} fontSize="10" fontFamily="var(--font-mono)" fill="currentColor">{linkLabel}</text>
      </g>
    </svg>
  );
}
