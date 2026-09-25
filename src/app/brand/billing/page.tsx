import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { getViewer } from "@/features/auth/server/session";
import { BrandBillingView } from "@/features/payouts/components/brand-billing/BrandBillingView";
import { parseTopupParam } from "@/features/payouts/schemas";
import { getBillingBuckets, getBrandLedger } from "@/features/payouts/server/queries";

export const metadata: Metadata = { title: `Billing · ${BRAND.wordmark}` };

// `?topup=<cents>` opens the top-up with that amount (the launch flow links here when the wallet is short).
export default async function BrandBillingPage({ searchParams }: { searchParams: Promise<{ topup?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const brand = viewer.brand;
  const [t, params] = await Promise.all([getTranslations("brand.billing"), searchParams]);
  const header = <PageHeader title={t("title")} description={t("description")} />;
  const data = await Promise.all([getBillingBuckets(brand.id), getBrandLedger(brand.id)]).catch((error) => {
    console.error("[billing] failed", { brandId: brand.id, error });
    return null;
  });
  if (!data) return <>{header}<ErrorState body={t("error")} retryHref="/brand/billing" /></>;
  const [buckets, ledger] = data;
  return <>{header}<BrandBillingView balanceCents={brand.walletCents} buckets={buckets} rows={ledger} suggestedCents={parseTopupParam(params.topup)} /></>;
}
