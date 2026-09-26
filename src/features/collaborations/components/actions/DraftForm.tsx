"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type DraftFormInput, draftFormSchema } from "../../schemas";
import { DRAFT_MAX_CHARS, DRAFT_MIN_CHARS } from "../../ui-constants";

type Props = { initialText: string; submitLabel: string; pendingLabel: string; disabled: boolean; onSubmit: (values: DraftFormInput) => Promise<boolean> };

const ROWS = 10;

// Used for the first draft and every resubmission (prefilled with the last one).
export function DraftForm({ initialText, submitLabel, pendingLabel, disabled, onSubmit }: Props) {
  const t = useTranslations("collaboration.detail");
  const form = useForm<DraftFormInput>({ resolver: zodResolver(draftFormSchema), defaultValues: { draftText: initialText } });
  const { errors, isSubmitting } = form.formState;
  const length = useWatch({ control: form.control, name: "draftText" }).length;
  const error = errors.draftText ? (length > DRAFT_MAX_CHARS ? t("validation.draftMax", { max: DRAFT_MAX_CHARS }) : t("validation.draftMin", { min: DRAFT_MIN_CHARS })) : null;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3" noValidate>
      <div className="grid gap-1.5">
        <label htmlFor="draftText" className="text-small font-medium">{t("creator.draft.label")}</label>
        <Textarea id="draftText" rows={ROWS} maxLength={DRAFT_MAX_CHARS} aria-invalid={Boolean(error)} aria-describedby="draftText-hint" placeholder={t("creator.draft.placeholder")} {...form.register("draftText")} />
        <p id="draftText-hint" className="flex justify-between gap-3 text-caption">
          {error ? <span role="alert" className="text-failure">{error}</span> : <span className="text-ink-muted">{t("creator.draft.help", { min: DRAFT_MIN_CHARS })}</span>}
          <span className="num text-ink-muted">{t("creator.draft.counter", { count: length, max: DRAFT_MAX_CHARS })}</span>
        </p>
      </div>
      <Button type="submit" className="justify-self-start" disabled={disabled || isSubmitting}>{isSubmitting ? pendingLabel : submitLabel}</Button>
    </form>
  );
}
