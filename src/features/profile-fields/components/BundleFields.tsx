"use client";

import { Trash2 } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bundleSummary } from "@/features/creator-onboarding/bundles";
import { BUNDLE_MAX_POSTS, BUNDLE_MIN_POSTS } from "@/features/creator-onboarding/constants";
import type { PriceInput } from "@/features/creator-onboarding/schemas";
import { formatCents } from "@/lib/money";
import { describedBy, FormField } from "./FormField";
import { MoneyInput } from "./MoneyInput";

type Props = { index: number; control: Control<PriceInput>; bundle: PriceInput["bundles"][number]; priceCents: number; onRemove: () => void };

// One bundle: how many posts, the total net price, and what that means per post.
export function BundleFields({ index, control, bundle, priceCents, onRemove }: Props) {
  const summary = bundleSummary(bundle, priceCents);
  const postsId = `bundle-${index}-posts`;
  const totalId = `bundle-${index}-total`;
  return (
    <fieldset className="grid gap-3 rounded-card border border-rule bg-paper p-4">
      <div className="flex items-center justify-between">
        <legend className="text-small font-medium text-ink">Bundle {index + 1}</legend>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove bundle ${index + 1}`}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name={`bundles.${index}.posts`}
          render={({ field, fieldState }) => (
            <FormField id={postsId} label="Posts" error={fieldState.error?.message}>
              <Input id={postsId} type="number" inputMode="numeric" min={BUNDLE_MIN_POSTS} max={BUNDLE_MAX_POSTS} step={1} className="num" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(postsId, fieldState.error?.message)} />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name={`bundles.${index}.totalCents`}
          render={({ field, fieldState }) => (
            <FormField id={totalId} label="Total net price" error={fieldState.error?.message}>
              <MoneyInput id={totalId} cents={field.value} onCents={field.onChange} invalid={fieldState.invalid} describedBy={describedBy(totalId, fieldState.error?.message)} />
            </FormField>
          )}
        />
      </div>
      <p aria-live="polite" className="num text-caption text-ink-muted">
        {formatCents(summary.perPostCents, "EUR")} per post · the brand saves {formatCents(summary.savedCents, "EUR")}
      </p>
    </fieldset>
  );
}
