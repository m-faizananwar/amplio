"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { toDateInputValue } from "@/lib/dates";
import { type ScheduleFormInput, scheduleFormSchema } from "../../schemas";

type Props = { id: string; onSubmit: (values: ScheduleFormInput) => Promise<boolean>; onDone: () => void };

// Pick the publish day; past days can't be picked. The submit lives in the
// dialog footer (form={id}).
export function ScheduleForm({ id, onSubmit, onDone }: Props) {
  const t = useTranslations("collaboration.detail");
  const today = toDateInputValue(new Date());
  const form = useForm<ScheduleFormInput>({ resolver: zodResolver(scheduleFormSchema), defaultValues: { scheduledAt: today } });
  return (
    <form id={id} onSubmit={form.handleSubmit(async (v) => { if (await onSubmit(v)) onDone(); })} className="grid gap-3" noValidate>
      <Controller control={form.control} name="scheduledAt" render={({ field, fieldState }) => (
        <div className="grid gap-1.5">
          <label htmlFor="scheduledAt" className="text-small font-medium">{t("creator.schedule.label")}</label>
          <DatePicker id="scheduledAt" value={field.value || null} onValueChange={field.onChange} min={today} placeholder={t("creator.schedule.label")} />
          {fieldState.error ? <p role="alert" className="text-caption text-failure">{t("validation.dateFuture")}</p> : null}
        </div>
      )} />
    </form>
  );
}
