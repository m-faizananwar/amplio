"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useBump } from "@/components/motion/useBump";
import { RollingNumber } from "@/components/ui/rolling-number";
import { useWallet } from "../WalletProvider";


// Brand → Billing (the wallet), creator → Earnings (what can be withdrawn).
// Money is the one thing the accent colour is for. Reads the optimistic
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
      className="inline-flex h-9 items-center gap-2 rounded-chip border border-money/25 bg-money-soft px-3.5 outline-none transition-colors duration-(--duration-fast) ease-ledger hover:border-money/50 focus-visible:ring-2 focus-visible:ring-money"
    >
      <span className="hidden text-caption text-ink-muted sm:inline">{t("label")}</span>
      <span data-bump={bump ? bump % 2 : undefined} className="inline-flex"><RollingNumber value={wallet.walletCents} format={euros} className="text-small font-medium text-money" /></span>
    </Link>
  );
}
