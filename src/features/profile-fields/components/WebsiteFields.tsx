"use client";

import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { WebsiteInput } from "@/features/brand-onboarding/schemas";
import { describedBy, FormField } from "./FormField";

const HINT = "We read your site to draft your value proposition and ideal customers. You edit both before anything is saved.";

// websiteSchema: the company website the AI draft is read from.
export function WebsiteFields({ control }: { control: Control<WebsiteInput> }) {
  return (
    <Controller
      control={control}
      name="url"
      render={({ field, fieldState }) => (
        <FormField id="website" label="Company website" hint={HINT} error={fieldState.error?.message}>
          <Input
            id="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://yourcompany.com"
            aria-invalid={fieldState.invalid || undefined}
            aria-describedby={describedBy("website", fieldState.error?.message, HINT)}
            {...field}
            value={field.value ?? ""}
          />
        </FormField>
      )}
    />
  );
}
