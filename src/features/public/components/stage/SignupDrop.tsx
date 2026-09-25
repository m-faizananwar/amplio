import type { CSSProperties } from "react";

// Scene 3: sign-ups drop out of the brand's site into a ledger, which prints
// one row per sign-up with the creator's name on it.
const v = (o: Record<string, string | number>) => o as CSSProperties;

export function SignupDrop({ rows, signUpLabel }: { rows: string[]; signUpLabel: string }) {
  return (
    <svg viewBox="0 0 420 300" className="w-full text-ink" aria-hidden="true">
      {/* the site */}
      <g className="st-rise">
        <rect x="110" y="10" width="200" height="104" rx="10" fill="var(--color-surface)" stroke="var(--color-rule)" />
        {[0, 1, 2].map((i) => <circle key={i} cx={126 + i * 10} cy="24" r="3" fill="currentColor" opacity="0.2" />)}
        <rect x="130" y="42" width="110" height="7" rx="3.5" fill="currentColor" opacity="0.15" />
        <rect x="130" y="58" width="160" height="18" rx="5" fill="none" stroke="var(--color-rule)" />
        <rect x="130" y="84" width="160" height="20" rx="5" fill="currentColor" />
        <text x="210" y="98" fontSize="10" textAnchor="middle" fill="var(--color-paper)">{signUpLabel}</text>
      </g>
      {/* the ledger */}
      <rect x="60" y="140" width="300" height={rows.length * 44 + 8} rx="10" fill="var(--color-surface)" stroke="var(--color-rule)" />
      {rows.map((row, i) => (
        <g key={row}>
          <circle cx="210" cy="114" r="6" fill="var(--color-money)" className="st-fly" style={v({ "--dx": `${-128}px`, "--dy": `${48 + i * 44}px`, "--d": `${500 + i * 520}ms`, "--dur": "520ms" })} />
          <g className="st-rise" style={v({ "--d": `${950 + i * 520}ms` })}>
            <text x="100" y={167 + i * 44} fontSize="13" fill="currentColor">{row}</text>
            {i < rows.length - 1 ? <line x1="76" x2="344" y1={184 + i * 44} y2={184 + i * 44} stroke="var(--color-rule)" /> : null}
          </g>
        </g>
      ))}
    </svg>
  );
}
