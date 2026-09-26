import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { PageHeader } from "@/components/page/PageHeader";
import { BRAND } from "@/config/brand";
import { getViewer } from "@/features/auth/server/session";
import { AttributionByCreator } from "@/features/tracking/components/brand-results/AttributionByCreator";
import { ClicksOverTime } from "@/features/tracking/components/brand-results/ClicksOverTime";
import { PixelStatusCard } from "@/features/tracking/components/brand-results/PixelStatusCard";
import { BrandTrailCard } from "@/features/tracking/components/trail/BrandTrailCard";
import { SERIES_DAYS, type SeriesRange } from "@/features/tracking/constants";
import { getAttributionByCreator, getClicksSeries, getPixelStatus, getResultsSummary } from "@/features/tracking/server/queries";

export const metadata: Metadata = { title: `Results · ${BRAND.wordmark}` };
const EXPORT = "/brand/results/export";

async function currentOrigin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
}

// The proof page, in three blocks: four numbers that each open the rows they
// are made of (live posts, the raw click log, sign-ups, the ledger), one chart
// card with the pixel that makes attribution possible in its footer, and the
// per-creator table. The posts list and the click log were separate sections
// repeating what the reach and clicks drawers already open.
// A sum of unknowns is not a measurement: when no live post's views are known,
// the card says so instead of showing 0.
const reachValue = (s: { estReach: number; publishedPosts: number; reachUnknown: number }) =>
  s.publishedPosts > 0 && s.reachUnknown === s.publishedPosts ? null : s.estReach;

export default async function BrandResultsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.brand) redirect("/login");
  const brandId = viewer.brand.id;
  const [{ range: raw }, t, origin] = await Promise.all([searchParams, getTranslations("brand.results"), currentOrigin()]);
  const range: SeriesRange = raw && raw in SERIES_DAYS ? (raw as SeriesRange) : "month";
  const header = <PageHeader title={t("title")} description={t("description")} />;
  const data = await Promise.all([
    getResultsSummary(brandId), getClicksSeries(brandId, range), getAttributionByCreator(brandId), getPixelStatus(brandId),
  ]).catch((error) => {
    console.error("[results] failed", { brandId, error });
    return null;
  });
  if (!data) return <>{header}<ErrorState body={t("error")} retryHref="/brand/results" /></>;
  const [summary, series, attribution, pixel] = data;
  return (
    <>
      {header}
      <div className="grid gap-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BrandTrailCard kind="reach" label={t("numbers.reach.label")} value={reachValue(summary)} hint={[t("numbers.reach.hint", { count: summary.publishedPosts }), summary.reachUnknown ? t("numbers.reach.unknown", { count: summary.reachUnknown }) : null].filter(Boolean).join(" · ")} />
          <BrandTrailCard kind="clicks" label={t("numbers.clicks.label")} value={summary.clicksInWindow} hint={t("numbers.clicks.hint", { days: summary.windowDays })} exportHref={EXPORT} />
          <BrandTrailCard kind="signups" label={t("numbers.signups.label")} value={summary.signups} hint={t("numbers.signups.hint")} />
          <BrandTrailCard kind="spend" label={t("numbers.spend.label")} value={summary.committedCents} money hint={t("numbers.spend.hint", { count: summary.bookings })} />
        </div>
        <ClicksOverTime series={series} range={range} footer={pixel ? <PixelStatusCard pixel={pixel} origin={origin} inline /> : null} />
        <AttributionByCreator rows={attribution} exportPath={EXPORT} />
      </div>
    </>
  );
}
