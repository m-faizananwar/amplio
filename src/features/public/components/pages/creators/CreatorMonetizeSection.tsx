import { Bell, Check, Plus, Zap } from "lucide-react";
import { FOR_CREATORS } from "../../../page-copy";
import { CreatorAvatar } from "../../shared/CreatorAvatar";
import { LinkedInMark } from "../../shared/LinkedInMark";

import { BRAND } from "@/config/brand";
const M = FOR_CREATORS.monetize;
const BARS = [20, 45, 20, 90, 30, 100];
const CARD = "frost flex flex-col rounded-[48px] bg-card/80 p-5 ring-1 ring-border/60";
const MOCK = "mx-auto w-full max-w-60 rounded-xl bg-card p-4 shadow-md ring-1 ring-border/70";
const CAPTION = "mt-auto pt-6 text-center text-lg font-semibold";

function MediaKit() {
  return (
    <div className={CARD}>
      <div className={MOCK}>
        <div className="flex items-start gap-2">
          <CreatorAvatar name={M.mediaKit.name} className="size-8" />
          <div className="flex-1">
            <p className="text-xs font-semibold">{M.mediaKit.name}</p>
            <p className="text-[0.6rem] text-muted-foreground">{M.mediaKit.line}</p>
          </div>
          <LinkedInMark />
        </div>
        <div className="mt-2 flex gap-1.5 text-[0.6rem] font-semibold">
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">▶ {M.mediaKit.views}</span>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">◎ {M.mediaKit.reach}</span>
        </div>
        <div className="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
          {BARS.map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${h > 80 ? "bg-brand" : "bg-brand-soft"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-2 text-[0.6rem]">
          <span className="text-muted-foreground">{M.mediaKit.rateLabel}</span>
          <span className="text-xs font-bold">{M.mediaKit.rate}</span>
        </div>
      </div>
      <p className={CAPTION}>{M.mediaKit.caption}</p>
    </div>
  );
}

function Payment() {
  return (
    <div className={CARD}>
      <div className={MOCK}>
        <div className="flex items-center justify-between text-[0.65rem]">
          <span className="inline-flex items-center gap-1 font-semibold text-success">
            <Check className="size-3" aria-hidden="true" />
            {M.payment.title}
          </span>
          <span className="text-muted-foreground">{M.payment.when}</span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{M.payment.amount}</p>
        <p className="mt-1 flex items-center gap-2 text-[0.6rem]">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
            <Zap className="size-2.5" aria-hidden="true" />
            {M.payment.method}
          </span>
          <span className="text-muted-foreground">{M.payment.campaign}</span>
        </p>
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <CreatorAvatar name="Aya D" className="size-6" />
          <div>
            <p className="text-[0.65rem] font-semibold">{M.payment.line1}</p>
            <p className="text-[0.55rem] text-muted-foreground">{M.payment.line2}</p>
          </div>
        </div>
      </div>
      <p className={CAPTION}>{M.payment.caption}</p>
    </div>
  );
}

function OwnDeal() {
  return (
    <div className={CARD}>
      <div className={MOCK}>
        <p className="inline-flex items-center gap-2 text-xs font-semibold">
          <span className="flex size-5 items-center justify-center rounded-md bg-brand-soft text-brand">
            <Plus className="size-3" aria-hidden="true" />
          </span>
          {M.ownDeal.title}
        </p>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-2 text-[0.65rem]">
          <span className="text-muted-foreground">{M.ownDeal.site}</span>
          <span className="font-bold">{M.ownDeal.amount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-success/10 px-2.5 py-2 text-[0.65rem] font-semibold text-success">
          <span className="inline-flex items-center gap-1">
            <Zap className="size-2.5" aria-hidden="true" />
            {M.ownDeal.bonusLabel}
          </span>
          <span>{M.ownDeal.bonus}</span>
        </div>
        <p className="mt-2 text-[0.55rem] text-muted-foreground">{M.ownDeal.note}</p>
      </div>
      <p className={CAPTION}>{M.ownDeal.caption}</p>
    </div>
  );
}

function Request() {
  return (
    <div className={CARD}>
      <div className={MOCK}>
        <p className="flex items-start gap-2 text-xs font-semibold">
          <Bell className="mt-0.5 size-3.5 text-amber-500" aria-hidden="true" />
          {M.request.title}
        </p>
        <p className="mt-2 flex items-center justify-between text-[0.6rem]">
          <span className="rounded-full bg-brand-soft px-2 py-0.5 font-semibold text-brand">{M.request.tag}</span>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 font-semibold text-brand">{M.request.amount}</span>
        </p>
        <p className="mt-2 text-[0.55rem] text-muted-foreground">{M.request.deliver}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[0.65rem] font-semibold">
          <span className="rounded-md bg-foreground py-1.5 text-center text-background">{M.request.accept}</span>
          <span className="rounded-md bg-muted py-1.5 text-center">{M.request.decline}</span>
        </div>
      </div>
      <p className={CAPTION}>{M.request.caption}</p>
    </div>
  );
}

export function CreatorMonetizeSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="lg:pt-10">
          <h2 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            {M.title.replace(/\.$/, "")}
            <span className="text-brand">.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">{M.sub}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaKit />
          <Payment />
        </div>
      </div>
      {/* the "brands on Amplio" card showed borrowed customer logos: removed */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
        <OwnDeal />
        <Request />
      </div>
    </section>
  );
}
