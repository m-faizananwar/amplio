import type { CSSProperties } from "react";

type Props = { name: string; headline: string; price: string; bars: number[]; offerLabel: string; demoLabel: string };

// For creators: the card brands see assembles itself — the frame draws, the
// avatar drops in, the name lands letter by letter, the audience bars fill,
// the price stamps on — then a brand's offer flies in and opens to its price.
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function CardAssembly({ name, headline, price, bars, offerLabel, demoLabel }: Props) {
  const letters = name.split("");
  return (
    <svg viewBox="0 0 440 380" className="w-full text-ink" role="img" aria-label={`${name} · ${headline} · ${price}`}>
      <rect x="20" y="30" width="270" height="300" rx="14" pathLength={1} className="st-draw" fill="none" stroke="currentColor" strokeOpacity="0.3" style={v({ "--dur": "700ms" })} />
      <rect x="20" y="30" width="270" height="300" rx="14" fill="var(--color-surface)" className="st-rise" style={v({ "--d": "500ms" })} />
      <circle cx="64" cy="80" r="24" fill="currentColor" className="st-drop" style={v({ "--d": "650ms" })} />
      <text x="64" y="86" fontSize="17" fontWeight="600" textAnchor="middle" fill="var(--color-paper)" className="st-drop" style={v({ "--d": "650ms" })}>{name.slice(0, 1)}</text>
      <text x="100" y="76" fontSize="16" fontWeight="600" fill="currentColor">
        {letters.map((ch, i) => <tspan key={i} className="st-rise" style={v({ "--d": `${850 + i * 45}ms` })}>{ch}</tspan>)}
      </text>
      <text x="100" y="96" fontSize="11" fill="var(--color-ink-muted)" className="st-rise" style={v({ "--d": `${900 + letters.length * 45}ms` })}>{headline.length > 30 ? `${headline.slice(0, 29)}…` : headline}</text>
      <line x1="40" x2="270" y1="124" y2="124" stroke="var(--color-rule)" />
      {bars.map((h, i) => (
        <rect key={i} x={48 + i * 27} y={250 - h} width="18" height={h} rx="4" fill="currentColor" opacity={0.25 + (i % 3) * 0.2} className="st-grow-y" style={v({ "--d": `${1400 + i * 70}ms` })} />
      ))}
      <line x1="40" x2="270" y1="252" y2="252" stroke="var(--color-rule)" />
      <g className="st-pop" style={v({ "--d": "2200ms" })}>
        <rect x="176" y="270" width="98" height="40" rx="8" fill="var(--color-paper)" stroke="currentColor" strokeWidth="2" transform="rotate(-6 225 290)" />
        <text x="225" y="296" fontSize="16" fontWeight="600" textAnchor="middle" fontFamily="var(--font-mono)" fill="currentColor" transform="rotate(-6 225 290)">{price}</text>
      </g>
      {/* a brand's offer arrives */}
      <g className="st-in-r" style={v({ "--d": "2700ms" })}>
        <rect x="302" y="150" width="130" height="86" rx="10" fill="var(--color-paper)" stroke="currentColor" />
        <path d="M302 160 L367 200 L432 160" fill="none" stroke="currentColor" pathLength={1} className="st-draw" style={v({ "--d": "3100ms" })} />
        <text x="367" y="226" fontSize="10" textAnchor="middle" fill="var(--color-ink-muted)">{offerLabel}</text>
        <text x="367" y="196" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--color-money)" className="st-pop" style={v({ "--d": "3400ms" })}>{price}</text>
      </g>
      <text x="20" y="362" fontSize="10" fill="var(--color-ink-muted)">{demoLabel}</text>
    </svg>
  );
}
