"use client";

import { type Control, useController } from "react-hook-form";
import type { BriefFormValues } from "../../schemas";

type Props = {
  control: Control<BriefFormValues>;
  name: "targetIndustries" | "targetGeos";
  label: string;
  options: readonly string[];
};

// Multi-select chips: each option is a real toggle button, so the field is
// keyboard reachable and announces its state.
export function ChipSelectField({ control, name, label, options }: Props) {
  const { field } = useController({ control, name });
  const selected = new Set(field.value);
  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    field.onChange(options.filter((o) => next.has(o)));
  }
  return (
    <fieldset>
      <legend className="text-small font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected.has(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option)}
              className={`rounded-chip border px-3 py-1 text-caption transition-colors duration-(--duration-fast) outline-none focus-visible:ring-3 focus-visible:ring-ink/15 ${on ? "border-ink bg-ink text-paper" : "border-rule bg-surface hover:bg-tint"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
