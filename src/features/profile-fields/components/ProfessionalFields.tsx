"use client";

import { type Control, Controller, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, EU_COUNTRY_CODES, PROFESSIONAL_COPY } from "@/features/creator-onboarding/constants";
import type { ProfessionalInput } from "@/features/creator-onboarding/schemas";
import { describedBy, FormField } from "./FormField";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

function Acknowledgement({ control, name, text }: { control: Control<ProfessionalInput>; name: "taxAcknowledged" | "invoicingAuthorized"; text: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-1">
          <label htmlFor={name} className="flex items-start gap-3 text-small text-ink">
            <Checkbox id={name} className="mt-0.5" checked={field.value === true} onCheckedChange={(checked) => field.onChange(checked === true)} aria-invalid={fieldState.invalid || undefined} />
            <span>{text}</span>
          </label>
          {fieldState.error ? <p role="alert" className="pl-7 text-caption text-failure">{fieldState.error.message}</p> : null}
        </div>
      )}
    />
  );
}

// Where the activity is registered and whether it is a business.
function RegistrationFields({ control }: { control: Control<ProfessionalInput> }) {
  return (
    <>
      <Controller
        control={control}
        name="legalCountry"
        render={({ field, fieldState }) => (
          <FormField id="legalCountry" label="Registration country" error={fieldState.error?.message}>
            <Combobox id="legalCountry" options={COUNTRY_OPTIONS} value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} placeholder="Search a country" emptyText="No country matches" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="registeredBusiness"
        render={({ field }) => (
          <SegmentedControl
            label="I invoice as"
            value={field.value ? "business" : "individual"}
            onValueChange={(v) => field.onChange(v === "business")}
            options={[{ value: "business", label: "A registered business" }, { value: "individual", label: "An individual" }]}
          />
        )}
      />
    </>
  );
}

// professionalSchema: who invoices the brand — registration country, business
// or individual, legal name and address, and the two acknowledgements.
export function ProfessionalFields({ control }: { control: Control<ProfessionalInput> }) {
  const country = useWatch({ control, name: "legalCountry" });
  const business = useWatch({ control, name: "registeredBusiness" });
  const lead = EU_COUNTRY_CODES.has(country) ? PROFESSIONAL_COPY.eu.lead : PROFESSIONAL_COPY.outside.lead;
  return (
    <div className="grid gap-5">
      <p className="rounded-card border border-rule bg-paper p-4 text-small text-ink-muted">{lead}</p>
      <RegistrationFields control={control} />
      <Controller
        control={control}
        name="legalName"
        render={({ field, fieldState }) => (
          <FormField id="legalName" label={business ? "Company legal name" : "Full legal name"} error={fieldState.error?.message}>
            <Input id="legalName" autoComplete={business ? "organization" : "name"} aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("legalName", fieldState.error?.message)} {...field} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="legalAddress"
        render={({ field, fieldState }) => (
          <FormField id="legalAddress" label="Legal address" error={fieldState.error?.message}>
            <Textarea id="legalAddress" rows={3} autoComplete="street-address" aria-invalid={fieldState.invalid || undefined} aria-describedby={describedBy("legalAddress", fieldState.error?.message)} {...field} />
          </FormField>
        )}
      />
      <Acknowledgement control={control} name="taxAcknowledged" text={PROFESSIONAL_COPY.tax} />
      <Acknowledgement control={control} name="invoicingAuthorized" text={PROFESSIONAL_COPY.invoicing} />
    </div>
  );
}
