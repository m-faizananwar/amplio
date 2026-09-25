import type { CSSProperties } from "react";

// Scene 1: a post goes out. The share arrow on the post sends dots out into
// the creator's audience; each lands on a person, who lights up. Loops
// gently while on screen.
const ARROW = { x: 300, y: 222 };
const AUDIENCE = Array.from({ length: 26 }, (_, i) => {
  const ring = i < 10 ? 0 : i < 26 ? 1 : 2;
  const n = ring === 0 ? 10 : 16;
  const k = ring === 0 ? i : i - 10;
  const a = -Math.PI * 0.95 + (k / (n - 1)) * Math.PI * 0.9;
  const r = ring === 0 ? 70 : 118;
  return { x: 300 + Math.cos(a) * r * 1.1 - 40, y: 120 + Math.sin(a) * r * 0.62, reached: k % 3 === 0 };
});
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function ShareBurst({ name, linkLabel }: { name: string; linkLabel: string }) {
  return (
    <svg viewBox="0 0 420 340" className="w-full text-ink" aria-hidden="true">
      {AUDIENCE.map((p, i) => (
        <circle key={`a${i}`} cx={p.x} cy={p.y} r="5" fill="currentColor" opacity="0.18" />
      ))}
      {AUDIENCE.filter((p) => p.reached).map((p, i) => (
        <g key={`f${i}`}>
          <circle cx={p.x} cy={p.y} r="6" className="st-pop text-money" fill="currentColor" style={v({ "--d": `${900 + i * 140}ms` })} />
          <circle cx={ARROW.x} cy={ARROW.y} r="4" fill="var(--color-money)" className="st-fly-loop" style={v({ "--dx": `${p.x - ARROW.x}px`, "--dy": `${p.y - ARROW.y}px`, "--d": `${300 + i * 140}ms` })} />
        </g>
      ))}
      <g className="st-rise" style={v({ "--d": "0ms" })}>
        <rect x="70" y="176" width="270" height="140" rx="10" fill="var(--color-surface)" stroke="var(--color-rule)" />
        <circle cx="96" cy="202" r="12" fill="currentColor" />
        <text x="116" y="199" fontSize="12" fontWeight="600" fill="currentColor">{name}</text>
        <text x="116" y="213" fontSize="9" fill="var(--color-ink-muted)">LinkedIn</text>
        {[240, 260, 200].map((w, i) => <rect key={w} x="86" y={230 + i * 12} width={w * 0.9} height="5" rx="2.5" fill="currentColor" opacity="0.1" />)}
        <rect x="86" y="276" width="170" height="24" rx="6" fill="var(--color-paper)" stroke="currentColor" />
        <text x="96" y="292" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor">{linkLabel}</text>
        {/* the share arrow */}
        <g transform={`translate(${ARROW.x - 10} ${ARROW.y - 10})`}>
          <circle cx="10" cy="10" r="13" fill="var(--color-paper)" stroke="var(--color-rule)" />
          <path d="M5 13 L14 6 M9 6 H14 V11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
