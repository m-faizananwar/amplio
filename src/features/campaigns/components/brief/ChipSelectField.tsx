"use client";

import { useLocale } from "next-intl";
import { type Control, useController } from "react-hook-form";
import { type OptionGroup, useOptionLabel } from "@/i18n/useOptionLabel";
import type { BriefFormValues } from "../../schemas";

type Props = {
  control: Control<BriefFormValues>;
  name: "targetIndustries" | "targetGeos";
  label: string;
  options: readonly string[];
  /** Which translated list the stored values are labelled from. */
  group: OptionGroup;
};

// Multi-select chips: each option is a real toggle button, so the field is
// keyboard reachable and announces its state.
export function ChipSelectField({ control, name, label, options, group }: Props) {
  const { field } = useController({ control, name });
  const locale = useLocale();
  const optionLabel = useOptionLabel(group);
  // Stored values stay English; the chips read and sort in the reader's language.
  const shown = [...options].sort((a, b) => optionLabel(a).localeCompare(optionLabel(b), locale));
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
        {shown.map((option) => {
          const on = selected.has(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option)}
              className={`rounded-chip border px-3 py-1 text-caption transition-colors duration-(--duration-fast) outline-none focus-visible:ring-2 focus-visible:ring-money ${on ? "border-ink bg-ink text-paper" : "border-rule bg-surface hover:bg-tint"}`}
            >
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
