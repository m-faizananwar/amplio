export const EARNINGS_MONTHS = 6;
export const MIN_WITHDRAWAL_CENTS = 1_000;
export const PAYOUT_METHODS = ["stripe", "bank"] as const;
export type PayoutMethod = (typeof PAYOUT_METHODS)[number];
export const TOPUP_PRESETS_CENTS = [250_000, 500_000, 1_000_000, 2_500_000] as const;
export const MIN_TOPUP_CENTS = 50_000;
// Guard against typos in the custom amount field (an extra zero), not a business limit.
export const MAX_TOPUP_CENTS = 10_000_000;
export const TOPUP_QUICK_PRESETS = 2;
export const BILLING_PATH = "/brand/billing";
export const EARNINGS_PATH = "/creator/earnings";
