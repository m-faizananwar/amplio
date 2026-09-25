// Scene 5: each sign-up snaps into a ledger row with a name on it; paying for
// the live post prints a row too, stamped. Names are demo-workspace creators.
type Props = { rows: string[]; paidRow: string; stamp: string };

export function LedgerVisual({ rows, paidRow, stamp }: Props) {
  return (
    <div className="mx-auto w-full max-w-md rounded-card border border-rule bg-surface">
      <ul className="divide-y divide-rule">
        {rows.map((row, i) => (
          <li key={row} className="cut flex items-center gap-3 px-4 py-3.5 text-body" style={{ ["--d" as string]: `${i * 110}ms` }}>
            <span className="size-2 rounded-full bg-money" aria-hidden="true" />
            {row}
          </li>
        ))}
        <li className="cut relative flex items-center gap-3 px-4 py-3.5 text-body font-semibold" style={{ ["--d" as string]: `${rows.length * 110}ms` }}>
          <span className="size-2 rounded-full bg-ink" aria-hidden="true" />
          {paidRow}
          <span className="stamp ml-auto rounded-control border-2 border-money px-2 py-0.5 text-caption font-bold tracking-[0.12em] text-money" style={{ ["--d" as string]: `${rows.length * 110 + 200}ms` }}>
            {stamp}
          </span>
        </li>
      </ul>
    </div>
  );
}
