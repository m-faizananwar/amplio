import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { getViewer } from "@/features/auth/server/session";
import { EarningsView } from "@/features/payouts/components/earnings/EarningsView";
import { getCreatorLedger, getEarningsByMonth, getEarningsSummary } from "@/features/payouts/server/queries";
import { getCreatorSettings } from "@/features/workspace/server/settings-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Earnings · ${BRAND.wordmark}` };

export default async function CreatorEarningsPage({ searchParams }: { searchParams: Promise<{ withdraw?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const creatorId = viewer.creator.id;
  const [{ withdraw }, t] = await Promise.all([searchParams, getTranslations("creator.earnings")]);
  const header = <PageHeader title={t("title")} description={t("description")} />;
  let data;
  try {
    data = await Promise.all([getEarningsSummary(creatorId), getEarningsByMonth(creatorId), getCreatorLedger(creatorId), getCreatorSettings(creatorId)]);
  } catch (error) {
    console.error("[earnings] creator earnings failed", { creatorId, error });
    return <>{header}<ErrorState body={t("error.body")} retryHref="/creator/earnings" /></>;
  }
  const [summary, months, ledger, settings] = data;
  const payout = settings?.payout ?? { method: null, accountHolder: "", ibanLast4: "" };
  return (
    <>
      {header}
      <EarningsView summary={summary} months={months} ledger={ledger} payout={payout} openWithdraw={withdraw === "1"} />
    </>
  );
}
