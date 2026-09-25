type Item = { q: string; a: string };

// Questions as ruled rows that open in place — native <details>, keyboard
// and screen-reader friendly, the "+" turning to "×" on open.
export function QuestionList({ items }: { items: Item[] }) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lead font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="mt-0.5 text-h4 leading-none text-ink-muted transition-transform duration-(--duration-fast) ease-ledger group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-ink-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
