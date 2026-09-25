"use client";

import { ArrowLeftRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MIN_TOPUP_CENTS, TOPUP_STEP_CENTS } from "../../constants";
import type { CreatorDto } from "../../schemas";
import { bookCreator } from "../../server/actions";
import { useMarketplace } from "../useMarketplace";
import { BookingSent } from "./BookingSent";
import { InsufficientFundsCta } from "./InsufficientFundsCta";

type Option = "single" | "bundle";
const CENTS = 100;

export function topupFor(shortfallCents: number) {
  return Math.max(MIN_TOPUP_CENTS, Math.ceil(shortfallCents / TOPUP_STEP_CENTS) * TOPUP_STEP_CENTS);
}

type RateProps = { creator: CreatorDto; option: Option; onBook: () => void; onNegotiate?: () => void; pending: boolean; walletCents: number };

function RateRow({ creator, option, onBook, onNegotiate, pending, walletCents }: RateProps) {
  const t = useTranslations("brand.creators.booking");
  const format = useFormatter();
  const feeCents = option === "single" ? creator.priceCents : (creator.bundle?.totalCents ?? 0);
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const short = walletCents < feeCents;
  return (
    <div className="grid gap-3 rounded-control border border-rule p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium">{option === "single" ? t("single") : t("bundle", { count: creator.bundle?.posts ?? 0 })}</p>
        <p className="num text-lead font-semibold">{euros(feeCents)}</p>
      </div>
      <p className="text-caption text-ink-muted">{option === "single" ? t("singleHint") : t("bundleHint")}</p>
      {short ? (
        <InsufficientFundsCta topupCents={topupFor(feeCents - walletCents)} walletCents={walletCents} feeCents={feeCents} />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onNegotiate ? <Button type="button" variant="secondary" onClick={onNegotiate} disabled={pending}><ArrowLeftRight aria-hidden="true" />{t("negotiate")}</Button> : null}
          <Button type="button" onClick={onBook} disabled={pending}>{pending ? t("inviting") : t("invite", { amount: euros(feeCents) })}</Button>
        </div>
      )}
    </div>
  );
}

// Invite at the listed price (or the bundle), or go to "make an offer". The
// fee is held from the wallet when the invitation is sent.
export function SelectionDialog() {
  const t = useTranslations("brand.creators.booking");
  const { booking, closeBooking, setBookingStep, markInvited, ctx } = useMarketplace();
  const [pending, setPending] = useState<Option | null>(null);
  const [error, setError] = useState<string | null>(null);
  const open = booking !== null && booking.step !== "offer";
  const creator = booking?.creator;

  async function book(option: Option) {
    if (!creator || !ctx.selectedCampaign) return;
    setPending(option);
    setError(null);
    const result = await bookCreator({ campaignId: ctx.selectedCampaign.id, creatorId: creator.id, option });
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    markInvited(creator.id, result.data.status);
    setBookingStep("sent", result.data.acceptBy);
    toast.success(t("sentToast", { name: creator.name }));
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : closeBooking())}>
      <DialogContent className="sm:max-w-md">
        {creator && booking?.step === "sent" ? <BookingSent creatorName={creator.name} acceptBy={booking.acceptBy} onClose={closeBooking} /> : null}
        {creator && booking?.step === "selection" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title", { name: creator.name })}</DialogTitle>
              <DialogDescription>{ctx.selectedCampaign ? t("forCampaign", { campaign: ctx.selectedCampaign.name }) : t("noCampaign")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <RateRow creator={creator} option="single" walletCents={ctx.walletCents} pending={pending === "single"} onBook={() => book("single")} onNegotiate={() => setBookingStep("offer")} />
              {creator.bundle ? <RateRow creator={creator} option="bundle" walletCents={ctx.walletCents} pending={pending === "bundle"} onBook={() => book("bundle")} /> : null}
            </div>
            <p className="text-caption text-ink-muted">{t("held")}</p>
            {error ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{error}</p> : null}
            <DialogFooter><Button type="button" variant="ghost" onClick={closeBooking}>{t("cancel")}</Button></DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
