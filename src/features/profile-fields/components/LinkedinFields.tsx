"use client";

import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { LinkedinInput } from "@/features/creator-onboarding/schemas";
import { describedBy, FormField } from "./FormField";

const HINT = "Your public profile, like https://www.linkedin.com/in/your-name. We read your headline and audience from it.";

// linkedinSchema: the public profile URL. Onboarding step 1, Settings › LinkedIn.
export function LinkedinFields({ control }: { control: Control<LinkedinInput> }) {
  return (
    <Controller
      control={control}
      name="linkedinUrl"
      render={({ field, fieldState }) => (
        <FormField id="linkedinUrl" label="LinkedIn profile URL" hint={HINT} error={fieldState.error?.message}>
          <Input
            id="linkedinUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://www.linkedin.com/in/your-name"
            aria-invalid={fieldState.invalid || undefined}
            aria-describedby={describedBy("linkedinUrl", fieldState.error?.message, HINT)}
            {...field}
          />
        </FormField>
      )}
    />
  );
}
