import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { RingWidget } from "@/components/ui/ring-widget";
import { BRAND } from "@/config/brand";
import { getViewer } from "@/features/auth/server/session";
import { getLaunchPlan } from "@/features/campaigns/server/queries";
import { listBrandCollaborations } from "@/features/collaborations/server/queries";
import { getResultsSummary } from "@/features/tracking/server/queries";
import { BrandTrailCard } from "@/features/tracking/components/trail/BrandTrailCard";
import { brandNeedsYou } from "@/features/workspace/components/brand-overview/brand-needs";
import { NeedsYouList } from "@/features/workspace/components/brand-overview/NeedsYouList";
import { SetupCard } from "@/features/workspace/components/brand-overview/SetupCard";
import { LOW_WALLET_CENTS } from "@/features/workspace/constants";
import { countByFilter } from "@/lib/next-step";

export const metadata: Metadata = { title: `Overview · ${BRAND.wordmark}` };

// One screen: Needs you beside the ring (every collaboration by whose move it
// is, each arc opening its filter), then three numbers that open their rows.
// Setup shows only while it is unfinished.
export default async function BrandOverviewPage() {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const [t, tc] = await Promise.all([getTranslations("brand.overview"), getTranslations("brand.collaborations")]);
  const brand = viewer.brand;
  const loaded = await Promise.all([listBrandCollaborations(brand.id), getResultsSummary(brand.id), getLaunchPlan(brand.id)]).catch((error) => {
    console.error("[overview] brand overview failed", { brandId: brand.id, error });
    return null;
  });
  const header = <PageHeader title={t("title", { name: viewer.firstName })} description={t("description", { company: brand.company })} actions={<Link href="/brand/campaigns/new" className={buttonVariants()}>{t("newCampaign")}</Link>} />;
  if (!loaded) return <>{header}<ErrorState body={t("error")} retryHref="/brand" /></>;
  const [collabs, summary, plan] = loaded;
  // Same grouping as the Needs-you list and the Collaborations tabs: a live
  // post whose payment is the brand's to release counts as Needs you.
  const counts = countByFilter(collabs.map((c) => c.status), "brand");
  const list = "/brand/collaborations?filter=";
  const segments = [
    { key: "needs_you", label: tc("filters.needsYou"), count: counts.needs_you, href: `${list}needs_you` },
    { key: "waiting", label: tc("filters.waiting"), count: counts.waiting, href: `${list}waiting` },
    { key: "done", label: tc("filters.done"), count: counts.done, href: `${list}done` },
  ];
  return (
    <>
      {header}
      <div className="grid gap-10">
        {plan.stepsLeft > 0 ? <SetupCard plan={plan} /> : null}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-labelledby="needs-title" className="grid gap-4">
            <h2 id="needs-title" className="text-h4">{t("needsYou.title")}</h2>
            <NeedsYouList items={brandNeedsYou(collabs)} lowWalletCents={brand.walletCents < LOW_WALLET_CENTS ? brand.walletCents : null} />
          </section>
          {collabs.length > 0 ? <RingWidget className="sm:flex-col sm:items-stretch lg:mt-11" label={tc("title")} segments={segments} totalLabel={tc("filters.all")} /> : null}
        </div>
        <section aria-label={t("numbers.title")}>
          <div className="grid gap-4 md:grid-cols-3">
            <BrandTrailCard kind="clicks" label={t("numbers.clicks.label")} value={summary.clicksInWindow} hint={t("numbers.clicks.hint", { days: summary.windowDays })} exportHref="/brand/results/export" />
            <BrandTrailCard kind="signups" label={t("numbers.signups.label")} value={summary.signups} hint={t("numbers.signups.hint")} />
            <BrandTrailCard kind="spend" label={t("numbers.spend.label")} value={summary.committedCents} money hint={t("numbers.spend.hint", { count: summary.bookings })} />
          </div>
        </section>
      </div>
    </>
  );
}
