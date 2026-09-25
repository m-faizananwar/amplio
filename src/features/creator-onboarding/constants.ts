import { BRAND } from "@/config/brand";
export const ONBOARDING_ROOT = "/onboarding/creator";
export const ONBOARDING_STEPS = {
  linkedin: { path: `${ONBOARDING_ROOT}/linkedin`, step: 2, title: "Add your public LinkedIn profile" },
  card: { path: `${ONBOARDING_ROOT}/card`, step: 3, title: "Complete your creator card" },
  price: { path: `${ONBOARDING_ROOT}/price`, step: 4, title: "Complete your creator card" },
  professional: { path: `${ONBOARDING_ROOT}/professional`, step: 4, title: "Complete your professional information now?" },
} as const;
export const STEP_COUNT = 4;
export const WORKSPACE_AFTER_ONBOARDING = "/creator";

// The simulated Apify read: long enough to feel like a fetch, short enough not to annoy.
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

export const PANEL_COPY = {
  eyebrow: "Your marketplace card",
  title: "Build a card brands can trust.",
  body: "It updates live with your profile, analytics, positioning and price.",
} as const;

export const LINKEDIN_COPY = {
  intro: "No extension is needed. We'll retrieve only the minimum public information required to create your Basic card.",
  consent:
    `By clicking below, you authorize ${BRAND.name} to read your public profile once: name, photo, headline, country and follower count. We do not import your posts, engagement or private analytics.`,
  reading: "Reading your profile…",
  submit: "Read my public profile",
} as const;

export const PRICE_COPY = {
  eyebrow: "Our recommendation",
  intro: `${BRAND.name} recommends this starting price from the public audience and performance information currently available. You can change it now or later.`,
  net: `This is your net price per post. You can change it at any time from your ${BRAND.name} profile.`,
  create: "Create my marketplace profile",
  addBundle: "Add a bundle (optional)",
  addAnother: "+ Add another bundle",
  confirm: "Confirm my offer and create my profile",
} as const;

export const PROFESSIONAL_COPY = {
  eu: {
    lead: `To invoice brands and withdraw your earnings, ${BRAND.name} needs a registered professional activity (auto-entrepreneur, company or equivalent) in your country.`,
    detail: "This is required before applying to paid campaigns, accepting bookings, invoicing or withdrawing. You can fill it in now or later from Settings.",
  },
  outside: {
    lead: "Outside the EU you can continue as an individual. We only need the details brands will see on their invoices.",
    detail: "This is required before applying to paid campaigns, accepting bookings, invoicing or withdrawing. You can fill it in now or later from Settings.",
  },
  tax: `I confirm that I am solely responsible for declaring and paying taxes on the earnings I receive through ${BRAND.name}.`,
  invoicing: `I authorize ${BRAND.name} to issue invoices in my name to the brands I work with on the platform.`,
  save: "Save my information",
  later: "Go to my workspace — finish later",
} as const;

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
