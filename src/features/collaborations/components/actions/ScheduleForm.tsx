"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toDateInputValue } from "@/lib/dates";
import { type ScheduleFormInput, scheduleFormSchema } from "../../schemas";

type Props = { disabled: boolean; onSubmit: (values: ScheduleFormInput) => Promise<boolean> };

// Pick the publish day; past days can't be picked.
export function ScheduleForm({ disabled, onSubmit }: Props) {
  const t = useTranslations("collaboration.detail");
  const today = toDateInputValue(new Date());
  const form = useForm<ScheduleFormInput>({ resolver: zodResolver(scheduleFormSchema), defaultValues: { scheduledAt: today } });
  const { isSubmitting } = form.formState;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <Controller control={form.control} name="scheduledAt" render={({ field, fieldState }) => (
        <div className="grid gap-1.5 sm:w-64">
          <label htmlFor="scheduledAt" className="text-small font-medium">{t("creator.schedule.label")}</label>
          <DatePicker id="scheduledAt" value={field.value || null} onValueChange={field.onChange} min={today} placeholder={t("creator.schedule.label")} />
          {fieldState.error ? <p role="alert" className="text-caption text-failure">{t("validation.dateFuture")}</p> : null}
        </div>
      )} />
      <Button type="submit" disabled={disabled || isSubmitting}>{isSubmitting ? t("creator.schedule.pending") : t("creator.schedule.submit")}</Button>
    </form>
  );
}
