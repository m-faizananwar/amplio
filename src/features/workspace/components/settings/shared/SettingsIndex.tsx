// The in-page index: on wide screens a sticky list of the sections, on
// phones nothing (the sections are short enough to scroll).
export function SettingsIndex({ sections }: { sections: Array<{ id: string; label: string }> }) {
  return (
    <nav aria-label="Settings sections" className="hidden lg:block">
      <ol className="sticky top-24 grid gap-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block rounded-control px-3 py-1.5 text-small text-ink-muted transition-colors duration-(--duration-fast) ease-ledger hover:bg-tint hover:text-ink">{s.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
