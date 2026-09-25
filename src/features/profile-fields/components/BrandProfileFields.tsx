"use client";

import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICP_COUNT } from "@/features/brand-onboarding/constants";
import type { ProfileInput } from "@/features/brand-onboarding/schemas";
import { describedBy, FormField } from "./FormField";

const VALUE_PROP_HINT = "What you sell and to whom, in a few sentences. Creators read it before they apply.";
const INDEXES = Array.from({ length: ICP_COUNT }, (_, i) => i);

function IcpFields({ control, index }: { control: Control<ProfileInput>; index: number }) {
  const n = index + 1;
  return (
    <fieldset className="grid gap-3 rounded-card border border-rule bg-paper p-4">
      <legend className="flex items-center gap-2 text-small font-medium text-ink">
        <span aria-hidden="true" className="num grid size-5 place-items-center rounded-chip bg-ink text-caption text-paper">{n}</span>
        Ideal customer {n}
      </legend>
      <Controller
        control={control}
        name={`icps.${index}.title`}
        render={({ field, fieldState }) => (
          <FormField id={`icp-${n}-title`} label="Who" error={fieldState.error?.message}>
            <Input id={`icp-${n}-title`} placeholder="Head of growth at a Series A SaaS" aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(`icp-${n}-title`, fieldState.error?.message)} {...field} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name={`icps.${index}.description`}
        render={({ field, fieldState }) => (
          <FormField id={`icp-${n}-description`} label="What they need" error={fieldState.error?.message}>
            <Textarea id={`icp-${n}-description`} rows={3} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy(`icp-${n}-description`, fieldState.error?.message)} {...field} />
          </FormField>
        )}
      />
    </fieldset>
  );
}

// profileSchema: the value proposition and the three ideal customers.
export function BrandProfileFields({ control }: { control: Control<ProfileInput> }) {
  return (
    <div className="grid gap-5">
      <Controller
        control={control}
        name="valueProp"
        render={({ field, fieldState }) => (
          <FormField id="valueProp" label="Value proposition" hint={VALUE_PROP_HINT} error={fieldState.error?.message}>
            <Textarea id="valueProp" rows={5} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("valueProp", fieldState.error?.message, VALUE_PROP_HINT)} {...field} />
          </FormField>
        )}
      />
      <div className="grid gap-3 lg:grid-cols-3">
        {INDEXES.map((i) => <IcpFields key={i} control={control} index={i} />)}
      </div>
    </div>
  );
}
