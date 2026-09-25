import { BUNDLE_DEFAULT_DISCOUNT, BUNDLE_DEFAULT_POSTS, CENTS_PER_EURO } from "./constants";

export type Bundle = { posts: number; totalCents: number };

// "€268/post · brand saves €235" for a 5-post bundle at €1,340 against €315/post.
export function bundleSummary(bundle: Bundle, priceCents: number) {
  const perPostCents = bundle.posts > 0 ? Math.round(bundle.totalCents / bundle.posts) : 0;
  const savedCents = Math.max(0, priceCents * bundle.posts - bundle.totalCents);
  return { perPostCents, savedCents };
}

// A fresh bundle: the default size at the default discount, rounded to the euro.
export function defaultBundle(priceCents: number, posts = BUNDLE_DEFAULT_POSTS): Bundle {
  const raw = priceCents * posts * (1 - BUNDLE_DEFAULT_DISCOUNT);
  return { posts, totalCents: Math.round(raw / CENTS_PER_EURO) * CENTS_PER_EURO };
}
