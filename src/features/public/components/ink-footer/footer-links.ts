import { BRAND } from "@/config/brand";

// Our copy in the spec's slots (docs/reference/ink-footer-spec.md).
export const INK_BLURB = "Creator campaigns that connect, convert, and leave a trace you can measure";
export const INK_CONTACTS = {
  email: BRAND.supportEmail,
  phone: { label: "+92 000 0000000", href: "tel:+920000000000" },
  place: "Islamabad",
};
export const INK_COLUMNS = [
  {
    heading: "Product",
    aria: "Product",
    links: [
      { label: "Marketplace", href: "/brand/creators" },
      { label: "Campaigns", href: "/brand/campaigns" },
      { label: "Brief editor", href: "/brand/campaigns/new" },
      { label: "Results", href: "/brand/results" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    aria: "Company",
    links: [
      { label: "For creators", href: "/for-creators" },
    ],
  },
  {
    heading: "Care & Service",
    aria: "Care and service",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Help Center", href: "/faq" },
      { label: "Where’s My Booking", href: "/brand/collaborations" },
    ],
  },
] as const;
export const INK_LETTER = "Sign up for early notice on new creators and campaigns.";
export const INK_SOCIALS = ["LinkedIn", "X", "Instagram", "TikTok"] as const;
export const INK_LEGAL = [
  { label: "Privacy Notice", href: "/privacy" },
  { label: "Terms & Policies", href: "/terms" },
  { label: "Cookie Notice", href: "/privacy#cookies" },
] as const;
// Self-hosted: the spec's clip re-encoded to an 8s 1280px loop (~250KB) with its own poster.
export const INK_VIDEO = "/media/footer.mp4";
export const INK_POSTER = "/media/footer.jpg";
