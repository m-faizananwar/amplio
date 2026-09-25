"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

// Save sits under each section, enabled only when something changed; a
// failed save says why right here as well as in the toast.
export function SaveRow<T extends FieldValues>({ form, label = "Save", requireChange = true }: { form: UseFormReturn<T>; label?: string; requireChange?: boolean }) {
  const { isDirty, isSubmitting, errors } = form.formState;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
      <Button type="submit" disabled={(requireChange && !isDirty) || isSubmitting}>{isSubmitting ? "Saving…" : label}</Button>
      {errors.root?.message ? <p role="alert" className="text-caption text-failure">{errors.root.message}</p> : null}
    </div>
  );
}
