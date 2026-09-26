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

// What the preview card starts from on every step (the step's form overrides
// the fields it edits, live).
export type CreatorCardData = {
  name: string; avatarUrl: string; headline: string; country: string; industries: string[];
  followers: number; fromLinkedin: boolean; priceCents: number; bundles: number;
  legalName: string; legalCountry: string; registeredBusiness: boolean | null;
};

export function cardData(state: OnboardingState): CreatorCardData {
  const p = state.professional;
  return {
    name: state.name,
    avatarUrl: state.avatarUrl,
    headline: state.headline,
    country: state.country.toUpperCase(),
    industries: state.industries,
    followers: state.followers,
    fromLinkedin: state.profileRead && state.followers > 0,
    // the €20 floor is a registration placeholder, not a price the creator chose
    priceCents: state.onboarded || state.priceCents !== PRICE_FLOOR_CENTS ? state.priceCents : 0,
    bundles: state.bundles.length,
    legalName: p.legalName ?? "",
    legalCountry: (p.legalCountry ?? "").toUpperCase(),
    registeredBusiness: p.registeredBusiness ?? null,
  };
}
