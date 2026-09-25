"use client";

import { useFormatter, useTranslations } from "next-intl";
import { PersonAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMarketplace } from "../useMarketplace";
import { OfferForm } from "./OfferForm";

const CENTS = 100;

// Make an offer: a price below the listed one, a post-by date, the brief, and
// whether the draft needs approval. Sent as a funded invitation like any other.
export function OfferDialog() {
  const t = useTranslations("brand.creators.booking.offer");
  const format = useFormatter();
  const { booking, closeBooking, setBookingStep } = useMarketplace();
  const creator = booking?.creator;
  return (
    <Dialog open={booking?.step === "offer"} onOpenChange={(next) => (next ? undefined : closeBooking())}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {creator ? (
          <>
            <DialogHeader className="flex-row items-center gap-3 text-left">
              <PersonAvatar name={creator.name} src={creator.avatarUrl} size="lg" />
              <div className="min-w-0">
                <DialogTitle>{t("title")}</DialogTitle>
                <DialogDescription className="truncate">{t("subtitle", { name: creator.name, price: format.number(creator.priceCents / CENTS, { style: "currency", currency: "EUR" }) })}</DialogDescription>
              </div>
            </DialogHeader>
            <OfferForm key={creator.id} creator={creator} />
            <Button type="button" variant="ghost" onClick={() => setBookingStep("selection")} className="justify-self-start">{t("back")}</Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
