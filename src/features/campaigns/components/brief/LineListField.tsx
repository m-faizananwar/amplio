"use client";

import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, useController } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BRIEF_LIST_MAX_ITEMS } from "../../constants";
import type { BriefFormValues } from "../../schemas";

type Props = {
  control: Control<BriefFormValues>;
  name: "do" | "avoid" | "links";
  label: string;
  placeholder: string;
  type?: "text" | "url";
};

// A list of one-line entries (Do / Avoid / Links). Empty lines are dropped by
// the schema on save.
export function LineListField({ control, name, label, placeholder, type = "text" }: Props) {
  const t = useTranslations("brand.campaigns.brief.actions");
  const { field } = useController({ control, name });
  const lines = field.value;
  function update(index: number, value: string) {
    field.onChange(lines.map((line, i) => (i === index ? value : line)));
  }
  return (
    <fieldset>
      <legend className="text-small font-medium">{label}</legend>
      <ul className="mt-2 space-y-2">
        {lines.map((line, index) => (
          <li key={index} className="flex items-center gap-2">
            <label htmlFor={`${name}-${index}`} className="sr-only">
              {label} {index + 1}
            </label>
            <Input id={`${name}-${index}`} type={type} value={line} placeholder={placeholder} onChange={(event) => update(index, event.target.value)} />
            <button
              type="button"
              aria-label={t("removeLine", { label, n: index + 1 })}
              onClick={() => field.onChange(lines.filter((_, i) => i !== index))}
              className="rounded-control p-1.5 text-ink-muted hover:bg-tint hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={lines.length >= BRIEF_LIST_MAX_ITEMS}
        onClick={() => field.onChange([...lines, ""])}
        className="mt-2 inline-flex items-center gap-1 text-small font-medium text-ink hover:underline disabled:opacity-45"
      >
        <Plus className="size-4" aria-hidden="true" /> {t("addLine")}
      </button>
    </fieldset>
  );
}
