"use client";

import { Bookmark } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { PersonAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/cn";
import { FitExplain } from "../ledger/FitExplain";
import { useMarketplace } from "../useMarketplace";
import { AudienceMix, Background, RecentPosts } from "./ProfileSections";

const CENTS = 100;
const PERCENT = 100;

// A creator in a wide drawer over the list, so comparing the next one is one
// click away: why they fit, their numbers, who follows them, what they post,
// and the price with the Invite button at the foot.
export function CreatorProfileDrawer() {
  const t = useTranslations("brand.creators.profile");
  const tr = useTranslations("brand.creators.row");
  const ts = useTranslations("collaboration.status");
  const format = useFormatter();
  const { profile: c, closeProfile, ctx, openBooking, collaborationStatus, isShortlisted, toggleShortlist } = useMarketplace();
  const euros = (cents: number) => format.number(cents / CENTS, { style: "currency", currency: "EUR" });
  const status = c ? collaborationStatus(c) : null;
  const saved = c ? isShortlisted(c) : false;
  return (
    <Drawer open={c !== null} onOpenChange={(open) => (open ? undefined : closeProfile())}>
      {c ? (
        <DrawerContent
          width="wide"
          heading={<span className="flex items-center gap-3"><PersonAvatar name={c.name} src={c.avatarUrl} size="lg" />{c.name}</span>}
          description={c.headline}
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <span className="text-small text-ink-muted">
                {t("price", { price: euros(c.priceCents) })}{c.bundle ? ` · ${t("bundle", { count: c.bundle.posts, price: euros(c.bundle.totalCents) })}` : ""}
              </span>
              <span className="flex gap-2">
                <Button variant="secondary" size="sm" aria-pressed={saved} onClick={() => toggleShortlist(c)}><Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden="true" />{saved ? t("saved") : t("save")}</Button>
                {status ? <Button size="sm" variant="secondary" disabled>{ts(status)}</Button> : <Button size="sm" disabled={!ctx.selectedCampaign} title={ctx.selectedCampaign ? undefined : tr("needCampaign")} onClick={() => openBooking(c)}>{tr("invite")}</Button>}
              </span>
            </div>
          }
        >
          <div className="grid gap-8 px-5 py-5">
            <FitExplain fit={c.fit} campaignName={ctx.selectedCampaign?.name ?? null} />
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                [t("numbers.followers"), format.number(c.followers, { notation: "compact" })],
                [t("numbers.views"), format.number(c.medianViews, { notation: "compact" })],
                [t("numbers.engagement"), `${(c.engagementRate * PERCENT).toFixed(1)}%`],
                [t("numbers.cpm"), c.cpmCents === null ? "—" : euros(c.cpmCents)],
              ].map(([label, value]) => (
                <div key={label}><dt className="text-caption text-ink-muted">{label}</dt><dd className="num mt-1 text-lead">{value}</dd></div>
              ))}
            </dl>
            <AudienceMix creator={c} />
            <RecentPosts creator={c} />
            <Background creator={c} />
          </div>
        </DrawerContent>
      ) : null}
    </Drawer>
  );
}
