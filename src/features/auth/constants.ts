import { BRAND } from "@/config/brand";
export const SESSION_COOKIE = `${BRAND.key}_session`;
export const SESSION_TTL_DAYS = 30;
export const CSRF_FIELD = "csrf";

export const HEARD_ABOUT_OPTIONS = ["LinkedIn", "Word of mouth", "Google search", "A creator", "Other"] as const;

export const DEMO_ACCOUNTS = {
  brand: { email: `brand@${BRAND.demoDomain}`, label: "Explore as demo brand" },
  creator: { email: `creator@${BRAND.demoDomain}`, label: "Explore as demo creator" },
} as const;
export const DEMO_DOMAINS = [BRAND.demoDomain] as const;
export const isDemoEmail = (email: string) => DEMO_DOMAINS.some((d) => email.endsWith(`@${d}`));

export const ROLE_HOME = { brand: "/brand", creator: "/creator" } as const;
export const ROLE_ONBOARDING = { brand: "/brand/setup", creator: "/creator/setup" } as const;

// Older /register?role=… values (and plain role names) → the role's sign-up.
export const REGISTER_ROLE_PARAM: Record<string, string> = { saas: "/register/brand", brand: "/register/brand", influencer: "/register/creator", creator: "/register/creator" };

// Password reset email (Resend). onboarding@resend.dev is Resend's shared
// sender for accounts without a verified domain.
export const RESET_EMAIL_FROM = `${BRAND.wordmark} <onboarding@resend.dev>`;
export const RESET_EMAIL_SUBJECT = `Reset your ${BRAND.wordmark} password`;
