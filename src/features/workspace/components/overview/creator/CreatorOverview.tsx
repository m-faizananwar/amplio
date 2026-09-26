import { getFormatter, getTranslations } from "next-intl/server";
import type { CollaborationDto } from "@/features/collaborations/schemas";
import type { LedgerRowDto } from "@/features/payouts/schemas";
import type { EarningsSummary } from "@/features/payouts/server/queries";
import type { CreatorClickRow } from "@/features/tracking/server/creator-queries";
import { PageHeader } from "@/components/page/PageHeader";
import { RingWidget } from "@/components/ui/ring-widget";
import { countByFilter, NEXT_STEP_FILTERS, type NextStepFilter, needsYou } from "@/lib/next-step";
import { CreatorNumbers } from "./CreatorNumbers";
import { NeedsYouList } from "./NeedsYouList";
import { toNeedsYouRows } from "./needs-you-rows";
import { clickRows, earnedRows, liveRows } from "./trails";

type Props = {
  collaborations: CollaborationDto[];
  earnings: EarningsSummary;
  ledger: LedgerRowDto[];
  clicks: CreatorClickRow[];
  clickTotal: number;
  setup: "detailPrice" | "detailIndustries" | "detailBoth" | null;
};

// Overview = Needs you beside the collaborations ring, then three numbers.
// Nothing else: everything else is one click away in the rail.
const RING_LABEL: Record<NextStepFilter, string> = { needs_you: "needsYou", waiting: "waitingOnBrand", live: "live", done: "done" };
export async function CreatorOverview({ collaborations, earnings, ledger, clicks, clickTotal, setup }: Props) {
  const [t, tn, tt, tf, format] = await Promise.all([
    getTranslations("creator.overview"), getTranslations("creator.overview.needsYou"), getTranslations("creator.trail"), getTranslations("creator.collaborations.filters"), getFormatter(),
  ]);
  const fmt = {
    money: (cents: number) => format.number(cents / 100, { style: "currency", currency: "EUR" }),
    date: (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short" }),
  };
  const items = needsYou(collaborations, { availableCents: earnings.availableCents, setupIncomplete: setup !== null });
  const rows = toNeedsYouRows(items, { byId: new Map(collaborations.map((c) => [c.id, c])), t: tn, fmt, setup: setup ?? "detailBoth" });
  const live = liveRows(collaborations);
  const byState = countByFilter(collaborations.map((c) => c.status), "creator");
  const segments = NEXT_STEP_FILTERS.map((key) => ({ key, label: tf(RING_LABEL[key]), count: byState[key], href: `/creator/collaborations?filter=${key}` }));
  const count = (metric: string, n: number) => tt("title", { metric, count: n });
  return (
    <>
      <PageHeader title={t("title")} description={rows.length > 0 ? `${tn("title")} · ${tn("description")}` : t("description")} />
      <div className="grid gap-8">
      {/* what needs you, beside where every collaboration stands; the ring's arcs open the matching filter */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <NeedsYouList rows={rows} labels={{ title: tn("title"), emptyTitle: t("allClear.title"), emptyBody: t("allClear.body"), emptyAction: t("allClear.action") }} />
        <RingWidget label={t("ring.label")} totalLabel={t("ring.total")} segments={segments} />
      </div>
      <CreatorNumbers
        labels={{ region: t("numbers.title"), open: t("numbers.openTrail"), empty: tt("empty.body") }}
        numbers={[
          { key: "earned", label: t("numbers.earned.label"), hint: t("numbers.earned.hint"), value: earnings.totalEarnedCents, money: true, rows: earnedRows(ledger), drawerTitle: count(t("numbers.earned.label"), earnedRows(ledger).length) },
          { key: "clicks", label: t("numbers.clicks.label"), hint: t("numbers.clicks.hint"), value: clickTotal, rows: clickRows(clicks, (k) => tt(`values.${k}`)), drawerTitle: count(t("numbers.clicks.label"), clickTotal) },
          { key: "live", label: t("numbers.livePosts.label"), hint: t("numbers.livePosts.hint"), value: live.length, rows: live, drawerTitle: count(t("numbers.livePosts.label"), live.length) },
        ]}
      />
      </div>
    </>
  );
}
