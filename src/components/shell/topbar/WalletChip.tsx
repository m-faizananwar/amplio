"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useBump } from "@/components/motion/useBump";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useWallet } from "../WalletProvider";


// Brand → Billing (the wallet), creator → Earnings (what can be withdrawn).
// Money is the one thing the accent colour is for, so the chip is a solid
// fill of it with the balance in white. Reads the optimistic
// balance, so a top-up moves the number before the server confirms.
const CENTS = 100;

export function WalletChip({ role, walletCents }: { role: "brand" | "creator"; walletCents: number }) {
  const t = useTranslations("shell.topBar.wallet");
  const wallet = useWallet(walletCents);
  const format = useFormatter();
  const bump = useBump(wallet.walletCents);
  // in the reader's locale, like every other amount (5 510,00 € in French)
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  return (
    <Link
      href={role === "brand" ? "/brand/billing" : "/creator/earnings"}
      className="inline-flex h-9 items-center gap-2 rounded-chip bg-money px-3.5 text-surface shadow-lift outline-none transition-[background-color,translate] duration-(--duration-fast) ease-ledger hover:bg-money/90 active:translate-y-px focus-visible:ring-2 focus-visible:ring-money focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <span className="hidden text-caption leading-none text-surface/80 sm:inline">{t("label")}</span>
      <span data-bump={bump ? bump % 2 : undefined} className="inline-flex"><RollingNumber value={wallet.walletCents} format={euros} className="text-small font-semibold leading-none text-surface" /></span>
    </Link>
  );
}
