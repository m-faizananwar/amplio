"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { RollingNumber } from "@/components/ui/rolling-number";
import { formatCents } from "@/lib/money";
import { useWallet } from "../WalletProvider";

const euros = (cents: number) => formatCents(cents, "EUR");

// Brand → Billing (the wallet), creator → Earnings (what can be withdrawn).
// Money is the one thing the accent colour is for. Reads the optimistic
// balance, so a top-up moves the number before the server confirms.
export function WalletChip({ role, walletCents }: { role: "brand" | "creator"; walletCents: number }) {
  const t = useTranslations("shell.topBar.wallet");
  const wallet = useWallet(walletCents);
  return (
    <Link
      href={role === "brand" ? "/brand/billing" : "/creator/earnings"}
      className="inline-flex h-9 items-center gap-2 rounded-control border border-rule bg-surface px-3 outline-none transition-colors duration-(--duration-fast) ease-ledger hover:border-rule-strong focus-visible:ring-3 focus-visible:ring-ink/15"
    >
      <span className="hidden text-caption text-ink-muted sm:inline">{t("label")}</span>
      <RollingNumber value={wallet.walletCents} format={euros} className="text-small font-medium text-money" />
    </Link>
  );
}
