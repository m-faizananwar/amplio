"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format as formatDate } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/dates";
import { type BasicsInput, basicsSchema, type CampaignDto } from "../../schemas";
import { updateCampaignBasics } from "../../server/actions";

const CENTS = 100;

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-small font-medium">{label}</label>
      {children}
      {error ? <p role="alert" className="text-caption text-failure">{error}</p> : null}
    </div>
  );
}

// Name, one line on what it's about, the date posts should be up by, and the
// default fee invitations start from (the creator's own price wins).
export function BasicsForm({ campaign, nextHref, cancelHref }: { campaign: CampaignDto; nextHref: string; cancelHref: string }) {
  const t = useTranslations("brand.campaigns.launch.basics");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<BasicsInput>({
    resolver: zodResolver(basicsSchema),
    defaultValues: { campaignId: campaign.id, name: campaign.name, description: campaign.description, postDeadline: toDateInputValue(campaign.postDeadline) },
    // The fee input owns its default in euros; setValueAs converts to cents on read.
  });
  const { errors, isSubmitting } = form.formState;
  async function onSubmit(values: BasicsInput) {
    setServerError(null);
    const result = await updateCampaignBasics(values);
    if (!result.ok) return void setServerError(result.error);
    router.push(nextHref);
    router.refresh();
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5 rounded-card border border-rule bg-surface p-5">
      <Field id="name" label={t("name")} error={errors.name ? t("errors.name") : undefined}><Input id="name" {...form.register("name")} /></Field>
      <Field id="description" label={t("description")} error={errors.description ? t("errors.description") : undefined}><Textarea id="description" rows={3} {...form.register("description")} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <span className="text-small font-medium">{t("deadline")}</span>
          <Controller control={form.control} name="postDeadline" render={({ field }) => <DatePicker value={field.value || null} onValueChange={field.onChange} min={formatDate(new Date(), "yyyy-MM-dd")} placeholder={t("deadlinePlaceholder")} />} />
          {errors.postDeadline ? <p role="alert" className="text-caption text-failure">{t("errors.deadline")}</p> : null}
        </div>
        <Field id="defaultFee" label={t("fee")} error={errors.defaultFeeCents ? t("errors.fee") : undefined}>
          <Input id="defaultFee" type="number" min={0} step={1} className="num" defaultValue={campaign.defaultFeeCents / CENTS} {...form.register("defaultFeeCents", { setValueAs: (v: string) => Math.round(Number(v || 0) * CENTS) })} />
        </Field>
      </div>
      {serverError ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{serverError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("saving") : t("saveContinue")}</Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>{t("cancel")}</Link>
      </div>
    </form>
  );
}
