import { z } from "zod";
import { MAX_TOPUP_CENTS, MIN_TOPUP_CENTS, MIN_WITHDRAWAL_CENTS, PAYOUT_METHODS } from "./constants";

export const withdrawSchema = z.object({
  amountCents: z.number().int().min(MIN_WITHDRAWAL_CENTS, "Minimum withdrawal is €10"),
  method: z.enum(PAYOUT_METHODS),
});
export type WithdrawInput = z.infer<typeof withdrawSchema>;

export const topUpSchema = z.object({
  amountCents: z.number().int().min(MIN_TOPUP_CENTS, "Minimum top-up is €500").max(MAX_TOPUP_CENTS, "That is more than we can credit in one go"),
});
export type TopUpInput = z.infer<typeof topUpSchema>;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export type LedgerRowDto = {
  id: string;
  date: string;
  type: "topup" | "booking" | "payout" | "withdrawal";
  status: "pending" | "completed";
  amountCents: number;
  reference: string;
  description: string;
  /** For a booking or payout: the creator (or brand) and the campaign it pays for. */
  detail?: string;
};

// The billing page accepts `?topup=<cents>` (e.g. from an under-funded booking).
export function parseTopupParam(raw: string | undefined): number | null {
  const parsed = topUpSchema.shape.amountCents.safeParse(Number(raw));
  return raw && parsed.success ? parsed.data : null;
}
