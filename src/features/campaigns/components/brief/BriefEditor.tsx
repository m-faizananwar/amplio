"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GEOGRAPHIES, INDUSTRIES } from "../../constants";
import { type Brief, type BriefFormValues, briefSchema } from "../../schemas";
import { saveBrief } from "../../server/actions";
import { AngleFields } from "./AngleFields";
import { BriefReadView } from "./BriefReadView";
import { ChipSelectField } from "./ChipSelectField";
import { LineListField } from "./LineListField";

type Props = { campaignId: string; initial: Brief; cancelHref: string; afterSaveHref: string; saveLabel?: string };

function TextField({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-medium">{label}</label>
      {children}
      {error ? (
        <p role="alert" className="text-caption text-failure">{error}</p>
      ) : null}
    </div>
  );
}

// The brief editor: exactly naano's fields, in their order. Used by the launch
// stepper and by Brief › "Edit the brief".
export function BriefEditor({ campaignId, initial, cancelHref, afterSaveHref, saveLabel }: Props) {
  const t = useTranslations("brand.campaigns.brief");
  const router = useRouter();
  const [preview, setPreview] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<BriefFormValues, unknown, Brief>({ resolver: zodResolver(briefSchema), defaultValues: initial });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(brief: Brief) {
    setServerError(null);
    const result = await saveBrief({ campaignId, brief });
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    toast.success(t("actions.saved"));
    router.push(afterSaveHref);
    router.refresh();
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>{preview ? t("actions.backToEdit") : t("actions.preview")}</Button>
      <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>{t("actions.cancel")}</Link>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("actions.saving") : saveLabel ?? t("actions.save")}</Button>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
      {preview ? (
        <BriefReadView brief={briefSchema.safeParse(form.getValues()).data ?? initial} />
      ) : (
        <div className="grid gap-6 rounded-card border border-rule bg-surface p-5">
          <TextField id="whatToTell" label={t("fields.whatToTell")} error={errors.whatToTell ? t("errors.whatToTell") : undefined}>
            <Textarea id="whatToTell" rows={6} {...form.register("whatToTell")} />
          </TextField>
          <ChipSelectField control={form.control} name="targetIndustries" label={t("fields.industries")} options={INDUSTRIES} />
          <ChipSelectField control={form.control} name="targetGeos" label={t("fields.geos")} options={GEOGRAPHIES} />
          <TextField id="tone" label={t("fields.tone")} error={errors.tone ? t("errors.tone") : undefined}>
            <Input id="tone" {...form.register("tone")} />
          </TextField>
          <LineListField control={form.control} name="do" label={t("fields.do")} placeholder={t("placeholders.do")} />
          <LineListField control={form.control} name="avoid" label={t("fields.avoid")} placeholder={t("placeholders.avoid")} />
          <LineListField control={form.control} name="links" label={t("fields.links")} placeholder="https://" type="url" />
          <AngleFields control={form.control} register={form.register} errors={errors} />
        </div>
      )}
      {serverError ? (
        <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{serverError}</p>
      ) : null}
      {actions}
    </form>
  );
}
