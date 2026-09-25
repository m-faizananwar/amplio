import { Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { formatCents } from "@/lib/money";
import { BILLING_PATH } from "../../constants";

type Props = { topupCents: number; walletCents: number; feeCents: number };

// Bookings are funded: when the wallet is short, the CTA becomes naano's
// "Add €500.00 and continue" and points at Billing.
export function InsufficientFundsCta({ topupCents, walletCents, feeCents }: Props) {
  return (
    <div className="grid gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/40">
      <p className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
        <Wallet className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Your balance is {formatCents(walletCents, "EUR")} and this booking holds {formatCents(feeCents, "EUR")}. Invitations are funded up front so the
          creator is paid on delivery.
        </span>
      </p>
      <Link href={BILLING_PATH} className={cn(buttonVariants({ size: "lg" }), "w-full bg-brand text-brand-foreground hover:bg-brand/90")}>
        Add {formatCents(topupCents, "EUR")} and continue
      </Link>
    </div>
  );
}
