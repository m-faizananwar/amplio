"use client";

import { Toggle } from "@/components/ui/toggle";
import { type OptionGroup, useOptionLabel } from "@/i18n/useOptionLabel";

type Props<T extends string> = { group: OptionGroup; options: readonly T[]; value: readonly T[]; onChange: (next: T[]) => void; max: number; error?: string; legend: string; help?: string; counter: string; name: string };

// Up to `max` choices as toggle chips; the rest disable once the limit is hit.
// Values stay as stored; only the chip label is translated.
export function IndustryPicker<T extends string>({ group, options, value, onChange, max, error, legend, help, counter, name }: Props<T>) {
  const label = useOptionLabel(group);
  const full = value.length >= max;
  const toggle = (option: T) => onChange(value.includes(option) ? value.filter((i) => i !== option) : full ? [...value] : [...value, option]);
  return (
    <fieldset className="grid gap-2" aria-describedby={error ? `${name}-error` : `${name}-count`}>
      <legend className="mb-1 text-small font-medium text-ink">{legend}</legend>
      {help ? <p className="-mt-1 text-caption text-ink-muted">{help}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = value.includes(option);
          return (
            <Toggle key={option} pressed={on} onPressedChange={() => toggle(option)} disabled={!on && full} size="sm"
              className="rounded-chip border border-rule px-3 text-caption text-ink-muted hover:bg-tint hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper data-[state=on]:bg-ink">
              {label(option)}
            </Toggle>
          );
        })}
      </div>
      {error ? <p id={`${name}-error`} role="alert" className="text-caption text-failure">{error}</p> : <p id={`${name}-count`} className="num text-caption text-ink-muted">{counter}</p>}
    </fieldset>
  );
}
