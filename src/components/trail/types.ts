// One row behind a number: a click, a sign-up, a ledger entry, a post.
// Queries map to this shape so the TrailDrawer can take them as they are.
export type TrailRow = {
  id: string;
  /** ISO timestamp. */
  at: string;
  /** Who or what: the creator, the campaign, the payout. */
  title: string;
  /** Where from: referrer · device, or the ledger description. */
  detail?: string;
  /** Short tag, e.g. "click", "sign-up", "payout". */
  source?: string;
  amountCents?: number;
  href?: string;
};
