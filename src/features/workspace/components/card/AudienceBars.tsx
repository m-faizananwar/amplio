type Props = { title: string; mix: Record<string, number>; percent: (share: number) => string; limit?: number };

const TOP = 4;

// Share of the audience per segment, largest first, as ruled bars.
export function AudienceBars({ title, mix, percent, limit = TOP }: Props) {
  const rows = Object.entries(mix).sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (rows.length === 0) return null;
  const max = rows[0]?.[1] || 1;
  return (
    <div>
      <p className="text-small text-ink-muted">{title}</p>
      <ul className="mt-2 grid gap-1.5">
        {rows.map(([label, share]) => (
          <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-small text-ink">{label}</span>
            <span className="num text-caption text-ink-muted">{percent(share)}</span>
            <span className="col-span-2 h-1 overflow-hidden rounded-chip bg-tint" aria-hidden="true">
              <span className="block h-full origin-left rounded-chip bg-ink animate-rise" style={{ width: `${(share / max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
