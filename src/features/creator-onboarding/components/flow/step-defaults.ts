import { PRICE_FLOOR_CENTS } from "@/lib/recommend-price";
import { COUNTRY_CODES } from "../../constants";
import { type CardInput, cardSchema, type ProfessionalInput } from "../../schemas";
import type { OnboardingState } from "../../server/queries";

// What each step's form starts from, given what we already know.

export function cardDefaults(state: OnboardingState): CardInput {
  const country = COUNTRY_CODES.find((c) => c === state.country.toUpperCase()) ?? COUNTRY_CODES[0];
  const industries = cardSchema.shape.industries.safeParse(state.industries);
  return { headline: state.headline, country, industries: industries.success ? industries.data : [] };
}

// registration seeds the €20 floor as a placeholder: until the creator picks a
// price, start from the recommendation
export function startingPrice(state: OnboardingState, recommended: number) {
  return state.onboarded || state.priceCents !== PRICE_FLOOR_CENTS ? state.priceCents : recommended;
}

export function legalDefaults(state: OnboardingState): Partial<ProfessionalInput> {
  const p = state.professional;
  const wanted = (p.legalCountry ?? state.country).toUpperCase();
  return {
    legalCountry: COUNTRY_CODES.find((c) => c === wanted) ?? COUNTRY_CODES[0],
    registeredBusiness: p.registeredBusiness ?? false,
    legalName: p.legalName || state.name,
    legalAddress: p.legalAddress,
    taxAcknowledged: p.taxAcknowledged ? true : undefined,
    invoicingAuthorized: p.invoicingAuthorized ? true : undefined,
  };
}
