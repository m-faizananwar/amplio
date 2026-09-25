import type { CSSProperties } from "react";

type Labels = { brand: string; creator: string; fee: string };

// Pricing: the coin a brand pays for one post rolls to the splitter — and
// all of it goes on to the creator. The fee slot opens, shows €0 and closes:
// in this build there is no cut (the ledger pays the creator the full price).
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function CoinSplit({ labels, price }: { labels: Labels; price: string }) {
  return (
    <svg viewBox="0 0 440 220" className="w-full text-ink" aria-hidden="true">
      <path d="M40 120 H400" stroke="var(--color-rule)" strokeWidth="2" />
      <path d="M220 120 C 260 120, 280 60, 330 60" stroke="var(--color-rule)" strokeWidth="2" fill="none" strokeDasharray="4 5" />
      <text x="40" y="160" fontSize="12" fill="var(--color-ink-muted)">{labels.brand}</text>
      <text x="400" y="160" fontSize="12" textAnchor="end" fill="var(--color-ink-muted)">{labels.creator}</text>
      {/* the fee slot: opens, reads €0, shrinks away */}
      <g className="st-pop" style={v({ "--d": "700ms" })}>
        <rect x="300" y="36" width="92" height="48" rx="10" fill="var(--color-paper)" stroke="var(--color-rule)" />
        <text x="346" y="56" fontSize="10" textAnchor="middle" fill="var(--color-ink-muted)">{labels.fee}</text>
        <text x="346" y="74" fontSize="15" textAnchor="middle" fontFamily="var(--font-mono)" fill="currentColor">€0</text>
      </g>
      {/* the coin rolls the whole way */}
      <g className="st-fly" style={v({ "--dx": "320px", "--dy": "0px", "--d": "200ms", "--dur": "1600ms" })}>
        <circle cx="60" cy="120" r="26" fill="var(--color-money)" />
        <circle cx="60" cy="120" r="20" fill="none" stroke="var(--color-paper)" strokeOpacity="0.5" />
        <text x="60" y="125" fontSize="13" textAnchor="middle" fontWeight="600" fill="var(--color-paper)">{price}</text>
      </g>
      <circle cx="380" cy="120" r="30" fill="none" stroke="var(--color-money)" strokeWidth="2" className="st-pop" style={v({ "--d": "1700ms" })} />
    </svg>
  );
}
