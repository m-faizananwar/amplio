export const ONBOARDING_ROOT = "/onboarding/creator";
export const ONBOARDING_STEPS = {
  linkedin: { path: `${ONBOARDING_ROOT}/linkedin`, step: 2, title: "Add your public LinkedIn profile" },
  card: { path: `${ONBOARDING_ROOT}/card`, step: 3, title: "Complete your creator card" },
  price: { path: `${ONBOARDING_ROOT}/price`, step: 4, title: "Complete your creator card" },
  professional: { path: `${ONBOARDING_ROOT}/professional`, step: 4, title: "Complete your professional information now?" },
} as const;
export const WORKSPACE_AFTER_ONBOARDING = "/creator";

// The simulated profile read: long enough to feel like a fetch (replaced by the real import next).
export const PROFILE_READ_DELAY_MS = 2500;


export const MAX_INDUSTRIES = 3;
export const HEADLINE_MAX = 220;
export const LINKEDIN_URL_MAX = 300;
export const LEGAL_TEXT_MAX = 200;
export const LEGAL_ADDRESS_MAX = 400;

// Bundles: naano's default is 5 posts at ~15% off the unit price.
export const BUNDLE_DEFAULT_POSTS = 5;
export const BUNDLE_MIN_POSTS = 2;
export const BUNDLE_MAX_POSTS = 24;
export const BUNDLE_DEFAULT_DISCOUNT = 0.15;
export const MAX_BUNDLES = 3;
export const CENTS_PER_EURO = 100;

// ISO 3166-1 alpha-2, the countries the onboarding select offers.
export const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ZA", name: "South Africa" },
  { code: "SG", name: "Singapore" },
] as const;
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]];
export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const EU_COUNTRY_CODES = new Set(["FR", "DE", "ES", "IT", "NL", "BE", "PT", "SE", "DK", "FI", "IE", "AT", "PL"]);
