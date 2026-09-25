"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Control, type FieldErrors, useFieldArray, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRIEF_ANGLES_MAX } from "../../constants";
import type { BriefFormValues } from "../../schemas";

type Props = { control: Control<BriefFormValues>; register: UseFormRegister<BriefFormValues>; errors: FieldErrors<BriefFormValues> };

const EMPTY_ANGLE = { angle: "", hook: "", direction: "", example: "" };

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-caption text-failure">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AngleFields({ control, register, errors }: Props) {
  const t = useTranslations("brand.campaigns.brief");
  const { fields, append, remove } = useFieldArray({ control, name: "angles" });
  return (
    <fieldset>
      <legend className="text-small font-medium">{t("sections.angles")}</legend>
      <div className="mt-2 space-y-4">
        {fields.map((field, index) => (
          <article key={field.id} className="rounded-control border border-rule p-4">
            <div className="flex items-center justify-between">
              <p className="num text-caption text-ink-muted">{String(index + 1).padStart(2, "0")}</p>
              <button type="button" onClick={() => remove(index)} className="inline-flex items-center gap-1 text-caption text-ink-muted hover:text-failure">
                <Trash2 className="size-3.5" aria-hidden="true" /> {t("actions.remove")}
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <Field id={`angle-${index}`} label={t("fields.angle")} error={errors.angles?.[index]?.angle ? t("errors.angle") : undefined}>
                <Input id={`angle-${index}`} {...register(`angles.${index}.angle`)} />
              </Field>
              <Field id={`hook-${index}`} label={t("fields.hook")}>
                <Input id={`hook-${index}`} {...register(`angles.${index}.hook`)} />
              </Field>
              <Field id={`direction-${index}`} label={t("fields.direction")}>
                <Textarea id={`direction-${index}`} rows={3} {...register(`angles.${index}.direction`)} />
              </Field>
              <Field id={`example-${index}`} label={t("fields.example")}>
                <Textarea id={`example-${index}`} rows={4} {...register(`angles.${index}.example`)} />
              </Field>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        disabled={fields.length >= BRIEF_ANGLES_MAX}
        onClick={() => append(EMPTY_ANGLE)}
        className="mt-3 inline-flex items-center gap-1 text-small font-medium text-ink hover:underline disabled:opacity-45"
      >
        <Plus className="size-4" aria-hidden="true" /> {t("actions.addAngle")}
      </button>
    </fieldset>
  );
}
