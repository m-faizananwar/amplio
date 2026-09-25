import { layoutTrail } from "./trail-layout";

const W = 1200;
const H = 640;

// The same trail, drawn once: what reduced motion, no WebGL, and the first
// paint (before three.js has loaded) all see. Scales with its box.
export function TrailFallback({ signups }: { signups: number }) {
  const t = layoutTrail(W, H, { audience: 72, ledgerRows: Math.max(signups, 1) });
  const L = t.ledger;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden="true">
      <g stroke="var(--color-ink)" strokeOpacity="0.09" strokeWidth="1">
        {t.audience.map((p, i) => {
          const s = t.sources[t.parentOf[i]];
          return <path key={i} d={`M${s.x} ${s.y}L${p.x} ${p.y}L${t.site.x} ${t.site.y}`} fill="none" />;
        })}
      </g>
      <g fill="var(--color-ink)">
        {t.audience.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fillOpacity="0.35" />)}
        <path d={`M${t.sources.map((p) => `${p.x} ${p.y}`).join("L")}`} stroke="var(--color-ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {t.sources.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="9" />)}
        <circle cx={t.site.x} cy={t.site.y} r="5" />
      </g>
      {/* a few clicks in flight, so a still frame shows the flow */}
      <g fill="var(--color-money)">
        {t.audience.filter((_, i) => i % 7 === 0).map((p, i) => {
          const s = t.sources[t.parentOf[t.audience.indexOf(p)]];
          const k = 0.35 + (i % 3) * 0.2;
          return <circle key={i} cx={s.x + (p.x - s.x) * k} cy={s.y + (p.y - s.y) * k} r="4" />;
        })}
      </g>
      {Array.from({ length: L.rows }, (_, r) => (
        <g key={r}>
          <rect x={L.x + 10} y={L.top + r * L.rowHeight - L.rowHeight * 0.27} width={L.rowWidth} height={L.rowHeight * 0.55} fill="var(--color-ink)" fillOpacity="0.14" />
          <circle cx={L.x} cy={L.top + r * L.rowHeight} r="3.5" fill="var(--color-money)" />
        </g>
      ))}
    </svg>
  );
}
