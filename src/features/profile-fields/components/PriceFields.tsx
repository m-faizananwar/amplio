"use client";

import { Plus } from "lucide-react";
import { type Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { defaultBundle } from "@/features/creator-onboarding/bundles";
import { CENTS_PER_EURO, MAX_BUNDLES } from "@/features/creator-onboarding/constants";
import type { PriceInput } from "@/features/creator-onboarding/schemas";
import { formatCents } from "@/lib/money";
import { PRICE_FLOOR_CENTS } from "@/lib/recommend-price";
import { BundleFields } from "./BundleFields";
import { describedBy, FormField } from "./FormField";
import { MoneyInput } from "./MoneyInput";

type Props = { control: Control<PriceInput>; /** Onboarding shows the suggested price; settings can too. */ recommendedCents?: number };

// priceSchema: net price per post (what the creator receives) and up to three bundles.
export function PriceFields({ control, recommendedCents }: Props) {
  const bundles = useFieldArray({ control, name: "bundles" });
  const live = useWatch({ control });
  const priceCents = live.priceCents ?? 0;
  const hint = recommendedCents ? `What you receive per post. Suggested for your audience: ${formatCents(recommendedCents, "EUR")}.` : "What you receive per post.";
  return (
    <div className="grid gap-5">
      <Controller
        control={control}
        name="priceCents"
        render={({ field, fieldState }) => (
          <FormField id="priceCents" label="Price per post" hint={hint} error={fieldState.error?.message}>
            <MoneyInput id="priceCents" cents={field.value} onCents={field.onChange} min={PRICE_FLOOR_CENTS / CENTS_PER_EURO} invalid={fieldState.invalid} describedBy={describedBy("priceCents", fieldState.error?.message, hint)} />
          </FormField>
        )}
      />
      {bundles.fields.map((field, index) => (
        <BundleFields
          key={field.id}
          index={index}
          control={control}
          bundle={{ posts: live.bundles?.[index]?.posts ?? field.posts, totalCents: live.bundles?.[index]?.totalCents ?? field.totalCents }}
          priceCents={priceCents}
          onRemove={() => bundles.remove(index)}
        />
      ))}
      {bundles.fields.length < MAX_BUNDLES ? (
        <Button type="button" variant="secondary" className="justify-self-start" onClick={() => bundles.append(defaultBundle(priceCents || recommendedCents || PRICE_FLOOR_CENTS))}>
          <Plus aria-hidden="true" />
          {bundles.fields.length === 0 ? "Offer a bundle" : "Add another bundle"}
        </Button>
      ) : null}
    </div>
  );
}
