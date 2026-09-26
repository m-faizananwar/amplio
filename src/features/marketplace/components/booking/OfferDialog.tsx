"use client";

import { HandCoins } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { useMarketplace } from "../useMarketplace";
import { OfferForm } from "./OfferForm";

const CENTS = 100;

// Make an offer: a price below the listed one, a post-by date, the brief, and
// whether the draft needs approval. Sent as a funded invitation like any other.
export function OfferDialog() {
  const t = useTranslations("brand.creators.booking.offer");
  const tb = useTranslations("brand.creators.booking");
  const format = useFormatter();
  const { booking, closeBooking, setBookingStep, ctx } = useMarketplace();
  const creator = booking?.creator;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  return (
    <ActionDialog
      open={booking?.step === "offer"}
      onOpenChange={(next) => (next ? undefined : closeBooking())}
      size="lg"
      icon={<HandCoins />}
      title={t("title")}
      sub={creator ? t("subtitle", { name: creator.name, price: euros(creator.priceCents) }) : ""}
      facts={creator ? [
        { label: tb("facts.creator"), value: creator.name },
        { label: t("facts.listed"), value: euros(creator.priceCents), mono: true },
        { label: tb("facts.wallet"), value: euros(ctx.walletCents), mono: true, tone: "money" },
      ] : []}
      cancelLabel={tb("cancel")}
    >
      {creator ? (
        <>
          <OfferForm key={creator.id} creator={creator} />
          <Button type="button" variant="ghost" onClick={() => setBookingStep("selection")} className="justify-self-start">{t("back")}</Button>
        </>
      ) : null}
    </ActionDialog>
  );
}
