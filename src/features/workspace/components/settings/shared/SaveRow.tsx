"use client";

import { useTranslations } from "next-intl";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

type Props<T extends FieldValues> = { form: UseFormReturn<T>; label?: string; requireChange?: boolean };

// Save sits under each section, enabled only when something changed; a
// failed save says why right here as well as in the toast.
export function SaveRow<T extends FieldValues>({ form, label, requireChange = true }: Props<T>) {
  const t = useTranslations("settings.creator.states");
  const { isDirty, isSubmitting, errors } = form.formState;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
      <Button type="submit" disabled={(requireChange && !isDirty) || isSubmitting}>{isSubmitting ? t("saving") : label ?? t("save")}</Button>
      {errors.root?.message ? <p role="alert" className="text-caption text-failure">{errors.root.message}</p> : null}
    </div>
  );
}
