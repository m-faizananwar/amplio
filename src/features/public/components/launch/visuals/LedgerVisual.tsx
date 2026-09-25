// Scene 5: each sign-up snaps into a ledger row with a name on it; paying for
// the live post prints a row too, stamped. Names are demo-workspace creators.
type Props = { rows: string[]; initials: string[]; paidRow: string; stamp: string };

export function LedgerVisual({ rows, initials, paidRow, stamp }: Props) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-card border border-rule bg-surface shadow-float">
      <ul className="divide-y divide-rule">
        {rows.map((row, i) => (
          <li key={row} className="cut flex items-center gap-3 px-5 py-4 text-lead" style={{ ["--d" as string]: `${i * 140}ms` }}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-money-soft text-small font-semibold text-money" aria-hidden="true">{initials[i]}</span>
            {row}
            <span className="size-2 shrink-0 rounded-full bg-money ml-auto" aria-hidden="true" />
          </li>
        ))}
        <li className="cut relative flex items-center gap-3 bg-paper px-5 py-4 text-lead font-semibold" style={{ ["--d" as string]: `${rows.length * 140}ms` }}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-small text-paper" aria-hidden="true">€</span>
          {paidRow}
          <span className="stamp ml-auto rounded-control border-2 border-money px-2.5 py-1 text-small font-bold tracking-[0.14em] text-money" style={{ ["--d" as string]: `${rows.length * 140 + 180}ms` }}>
            {stamp}
          </span>
        </li>
      </ul>
    </div>
  );
}
