"use client";

import { Toggle } from "@/components/ui/toggle";
import { INDUSTRIES } from "@/features/workspace/constants";

type Industry = (typeof INDUSTRIES)[number];
type Props = { value: readonly Industry[]; onChange: (next: Industry[]) => void; max: number; error?: string; legend: string };

// Up to `max` industries as toggle chips; the rest disable once the limit is hit.
export function IndustryPicker({ value, onChange, max, error, legend }: Props) {
  const full = value.length >= max;
  const toggle = (industry: Industry) =>
    onChange(value.includes(industry) ? value.filter((i) => i !== industry) : full ? [...value] : [...value, industry]);
  return (
    <fieldset className="grid gap-2" aria-describedby={error ? "industries-error" : "industries-count"}>
      <legend className="mb-1 text-small font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {INDUSTRIES.map((industry) => {
          const on = value.includes(industry);
          return (
            <Toggle
              key={industry}
              pressed={on}
              onPressedChange={() => toggle(industry)}
              disabled={!on && full}
              size="sm"
              className="rounded-chip border border-rule px-3 text-caption text-ink-muted hover:bg-tint hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper data-[state=on]:bg-ink"
            >
              {industry}
            </Toggle>
          );
        })}
      </div>
      {error ? (
        <p id="industries-error" role="alert" className="text-caption text-failure">{error}</p>
      ) : (
        <p id="industries-count" className="num text-caption text-ink-muted">{value.length} / {max}</p>
      )}
    </fieldset>
  );
}
