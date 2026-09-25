import { BRAND } from "@/config/brand";

// What the assistant may say about the product to someone who isn't signed
// in. Every line is something this build does — checked against the code, not
// the marketing page — so the assistant can't repeat a claim we can't back.
export const PRODUCT_FACTS: readonly string[] = [
  `${BRAND.name} is a B2B marketplace where brands book LinkedIn creators for sponsored posts, at the price each creator lists per post.`,
  "How it works, in three steps: the brand writes a brief and invites creators; the creator writes a draft and the brand approves it before anything is published; the post goes live with a tracked link, and every click, sign-up and payout is a row the brand can open.",
  "Booking is a funded invitation: the fee is held from the brand's wallet when the invitation is sent, shown as held until the creator accepts, and returned if they decline.",
  "Creators are paid the full fee when the brand pays for a live post; in this build no commission is deducted.",
  "Attribution: each collaboration gets a tracked link; the brand's site pixel ties sign-ups and purchases back to the click that brought them.",
  "The only stub in this build is payments: wallet top-ups and bank payouts run the full flow as ledger rows, but no card is charged and no money is sent (Stripe is not connected yet). The LinkedIn profile import is real: it reads the creator's public profile.",
  "Sign up at /register (brands: /register/brand, creators: /register/creator). Demo accounts for both sides are one click on /login.",
];
