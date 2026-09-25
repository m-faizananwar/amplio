"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format as formatDate } from "date-fns";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toCents } from "@/lib/money";
import { DEFAULT_DISCOUNT_PRESET, DEFAULT_POST_BY_DAYS } from "../../constants";
import { type CreatorDto, type OfferFormValues, offerFormSchema } from "../../schemas";
import { sendOffer } from "../../server/actions";
import { useMarketplace } from "../useMarketplace";
import { DiscountPresets, discountedCents } from "./DiscountPresets";
import { InsufficientFundsCta } from "./InsufficientFundsCta";
import { topupFor } from "./SelectionDialog";

const PERCENT = 100;
const CENTS = 100;
const ISO = "yyyy-MM-dd";

function discountOf(priceCents: number, offerCents: number) {
  return Math.max(0, Math.round(((priceCents - offerCents) / priceCents) * PERCENT));
}

// The offer: a price (a preset below the listed price or your own), the date
// the post must be up by, the campaign whose brief applies, and whether the
// draft needs your approval first. Held from the wallet when sent.
export function OfferForm({ creator }: { creator: CreatorDto }) {
  const t = useTranslations("brand.creators.booking.offer");
  const format = useFormatter();
  const { ctx, setBookingStep, markInvited } = useMarketplace();
  const [serverError, setServerError] = useState<string | null>(null);
  const campaigns = ctx.campaigns.filter((c) => c.status !== "completed");
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      preset: "20",
      offerEuros: discountedCents(creator.priceCents, DEFAULT_DISCOUNT_PRESET) / CENTS,
      postBy: formatDate(addDays(new Date(), DEFAULT_POST_BY_DAYS), ISO),
      campaignId: ctx.selectedCampaign?.id ?? campaigns[0]?.id ?? "",
      approveBeforePublish: true,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const offerCents = toCents(Number(form.watch("offerEuros")) || 0);
  const discount = discountOf(creator.priceCents, offerCents);
  const short = ctx.walletCents < offerCents;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });

  function choosePreset(preset: string) {
    form.setValue("preset", preset as OfferFormValues["preset"]);
    if (preset !== "other") form.setValue("offerEuros", discountedCents(creator.priceCents, Number(preset)) / CENTS, { shouldValidate: true });
  }

  async function onSubmit(values: OfferFormValues) {
    setServerError(null);
    const campaignName = campaigns.find((c) => c.id === values.campaignId)?.name ?? "";
    const result = await sendOffer({
      campaignId: values.campaignId,
      creatorId: creator.id,
      offerCents: toCents(values.offerEuros),
      discountPercent: discountOf(creator.priceCents, toCents(values.offerEuros)),
      postBy: values.postBy,
      approveBeforePublish: values.approveBeforePublish,
      note: campaignName || undefined,
    });
    if (!result.ok) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    markInvited(creator.id, result.data.status);
    setBookingStep("sent", result.data.acceptBy);
    toast.success(t("sentToast", { name: creator.name }));
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Controller control={form.control} name="preset" render={({ field }) => <DiscountPresets priceCents={creator.priceCents} value={field.value} onChange={choosePreset} />} />
        <label htmlFor="offer-euros" className="text-small font-medium">{t("amount")}</label>
        <Input id="offer-euros" type="number" step="1" min={0} inputMode="decimal" className="num" {...form.register("offerEuros", { valueAsNumber: true, onChange: () => form.setValue("preset", "other") })} aria-invalid={Boolean(errors.offerEuros)} />
        <p className="text-caption text-ink-muted">{t("discountNote", { percent: discount })}</p>
        {errors.offerEuros ? <p role="alert" className="text-caption text-failure">{errors.offerEuros.message}</p> : null}
      </div>
      <div className="grid gap-1.5">
        <span id="post-by-label" className="text-small font-medium">{t("postBy")}</span>
        <Controller control={form.control} name="postBy" render={({ field }) => <DatePicker value={field.value} onValueChange={field.onChange} min={formatDate(new Date(), ISO)} placeholder={t("postByPlaceholder")} />} />
        <p className="text-caption text-ink-muted">{t("postByHint", { days: DEFAULT_POST_BY_DAYS })}</p>
        {errors.postBy ? <p role="alert" className="text-caption text-failure">{errors.postBy.message}</p> : null}
      </div>
      <div className="grid gap-1.5">
        <span id="offer-campaign-label" className="text-small font-medium">{t("campaign")}</span>
        <Controller
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <Select value={field.value} items={Object.fromEntries(campaigns.map((c) => [c.id, c.name]))} onValueChange={(v) => field.onChange(String(v ?? ""))}>
              <SelectTrigger aria-labelledby="offer-campaign-label" className="w-full"><SelectValue placeholder={t("campaignPlaceholder")} /></SelectTrigger>
              <SelectContent>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
        <p className="text-caption text-ink-muted">{t("campaignHint")}</p>
        {errors.campaignId ? <p role="alert" className="text-caption text-failure">{errors.campaignId.message}</p> : null}
      </div>
      <Controller
        control={form.control}
        name="approveBeforePublish"
        render={({ field }) => (
          <label htmlFor="approve-first" className="flex items-center gap-2 text-body">
            <Checkbox id="approve-first" checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
            {t("approveFirst")}
          </label>
        )}
      />
      {serverError ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{serverError}</p> : null}
      {short ? (
        <InsufficientFundsCta topupCents={topupFor(offerCents - ctx.walletCents)} walletCents={ctx.walletCents} feeCents={offerCents} />
      ) : (
        <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? t("sending") : t("send", { amount: euros(offerCents) })}</Button>
      )}
      <p className="text-caption text-ink-muted">{t("held")}</p>
    </form>
  );
}
