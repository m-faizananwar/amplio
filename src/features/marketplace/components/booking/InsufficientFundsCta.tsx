import { Wallet } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { BILLING_PATH } from "../../constants";

type Props = { topupCents: number; walletCents: number; feeCents: number };

const CENTS = 100;

// Invitations are funded: when the wallet is short, the next step is a top-up
// of the missing amount (rounded up), which Billing opens pre-filled.
export function InsufficientFundsCta({ topupCents, walletCents, feeCents }: Props) {
  const t = useTranslations("brand.creators.booking.short");
  const format = useFormatter();
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  return (
    <div className="grid gap-3 rounded-control border border-attention/30 bg-attention-soft p-3 text-small">
      <p className="flex items-start gap-2 text-ink">
        <Wallet className="mt-0.5 size-4 shrink-0 text-attention" aria-hidden="true" />
        <span>{t("body", { balance: euros(walletCents), fee: euros(feeCents) })}</span>
      </p>
      <Link href={`${BILLING_PATH}?topup=${topupCents}`} className={buttonVariants({ className: "w-full" })}>{t("action", { amount: euros(topupCents) })}</Link>
    </div>
  );
}
