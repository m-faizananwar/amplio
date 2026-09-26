"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

type Props<T extends FieldValues> = { form: UseFormReturn<T>; label?: string; requireChange?: boolean };

const SETTLE_MS = 1400;

// Save sits under each section, enabled only when something changed. While it
// saves, the button shrinks into a spinner; then it shows a check, or shakes
// and says why right here as well as in the toast.
export function SaveRow<T extends FieldValues>({ form, label, requireChange = true }: Props<T>) {
  const t = useTranslations("settings.creator.states");
  const { isDirty, isSubmitting, errors } = form.formState;
  const [was, setWas] = useState(isSubmitting);
  const [outcome, setOutcome] = useState<"saved" | "error" | null>(null);
  if (isSubmitting !== was) {
    setWas(isSubmitting);
    setOutcome(isSubmitting ? null : errors.root ? "error" : "saved");
  }
  useEffect(() => {
    if (!outcome) return;
    const timer = setTimeout(() => setOutcome(null), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [outcome]);
  const status = isSubmitting ? "saving" : outcome ?? undefined;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
      <Button type="submit" status={status} disabled={(requireChange && !isDirty) || isSubmitting}>{isSubmitting ? t("saving") : label ?? t("save")}</Button>
      {errors.root?.message ? <p role="alert" className="text-caption text-failure">{errors.root.message}</p> : null}
    </div>
  );
}
