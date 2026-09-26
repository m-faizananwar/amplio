"use client";

import { Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type Control, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bundleSummary } from "@/features/creator-onboarding/bundles";
import { BUNDLE_MAX_POSTS, BUNDLE_MIN_POSTS } from "@/features/creator-onboarding/constants";
import type { PriceInput } from "@/features/creator-onboarding/schemas";
import { fieldError } from "./field-error";
import { describedBy, FormField } from "./FormField";
import { MoneyInput } from "./MoneyInput";
import { Hash } from "lucide-react";

type Props = { index: number; control: Control<PriceInput>; bundle: PriceInput["bundles"][number]; priceCents: number; onRemove: () => void };

const CENTS = 100;
const PERCENT = 100;

// One bundle: how many posts, the total net price, and what that means per post.
export function BundleFields({ index, control, bundle, priceCents, onRemove }: Props) {
  const t = useTranslations("settings.creator.pricing");
  const format = useFormatter();
  const money = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const summary = bundleSummary(bundle, priceCents);
  const off = priceCents > 0 ? Math.max(0, Math.round((1 - summary.perPostCents / priceCents) * PERCENT)) : 0;
  const postsId = `bundle-${index}-posts`;
  const totalId = `bundle-${index}-total`;
  return (
    <fieldset className="grid gap-3 rounded-card border border-rule bg-paper p-4">
      <div className="flex items-center justify-between">
        <legend className="text-small font-medium text-ink">{t("bundles.item", { count: index + 1 })}</legend>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={t("bundles.remove")}><Trash2 aria-hidden="true" /></Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Controller control={control} name={`bundles.${index}.posts`} render={({ field, fieldState }) => {
          const error = fieldError(fieldState.error, { too_small: t("errors.bundlePostsMin", { min: BUNDLE_MIN_POSTS }), too_big: t("errors.bundlePostsMax", { max: BUNDLE_MAX_POSTS }) });
          return (
            <FormField id={postsId} label={t("bundles.posts")} error={error}>
              <Input id={postsId} leadingIcon={<Hash />} type="number" inputMode="numeric" min={BUNDLE_MIN_POSTS} max={BUNDLE_MAX_POSTS} step={1} className="num" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(postsId, error)} />
            </FormField>
          );
        }} />
        <Controller control={control} name={`bundles.${index}.totalCents`} render={({ field, fieldState }) => (
          <FormField id={totalId} label={t("bundles.total")} error={fieldState.error ? t("errors.bundleTotal") : undefined}>
            <MoneyInput id={totalId} cents={field.value} onCents={field.onChange} invalid={fieldState.invalid} describedBy={describedBy(totalId, fieldState.error?.message)} />
          </FormField>
        )} />
      </div>
      <p aria-live="polite" className="num text-caption text-ink-muted">{t("bundles.perPost", { amount: money(summary.perPostCents) })} · {t("bundles.saving", { percent: off })}</p>
    </fieldset>
  );
}
