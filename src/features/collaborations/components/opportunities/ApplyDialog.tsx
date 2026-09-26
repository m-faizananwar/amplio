"use client";

import { Send } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { Button } from "@/components/ui/button";
import type { OpportunityDto } from "../../schemas";

type Props = { opportunity: OpportunityDto | null; onOpenChange: (open: boolean) => void; onConfirm: (o: OpportunityDto) => void };

const CENTS = 100;

// Applying is a commitment on the creator's own price, so it takes one
// confirm, with the brand, the price, the deadline and the fit in view.
export function ApplyDialog({ opportunity: o, onOpenChange, onConfirm }: Props) {
  const t = useTranslations("creator.opportunities.applyDialog");
  const tf = useTranslations("creator.opportunities.item");
  const format = useFormatter();
  if (!o) return <ActionDialog open={false} onOpenChange={onOpenChange} icon={<Send />} title="" sub="" action={null} cancelLabel={t("cancel")} />;
  return (
    <ActionDialog
      open
      onOpenChange={onOpenChange}
      icon={<Send />}
      title={t("title", { campaign: o.campaignName })}
      sub={t("description", { brand: o.brandCompany })}
      facts={[
        { label: t("brand"), value: o.brandCompany },
        { label: t("yourPrice"), value: format.number(o.listPriceCents / CENTS, { style: "currency", currency: "EUR" }), mono: true, tone: "money" },
        { label: t("deadline"), value: o.postDeadline ? format.dateTime(new Date(o.postDeadline), { dateStyle: "medium" }) : t("noDeadline"), mono: true },
        { label: t("channel"), value: t("channelValue") },
        { label: t("fit"), value: tf("fitScore", { percent: o.matchScore }), mono: true },
      ]}
      action={<Button type="button" icon={<Send />} onClick={() => onConfirm(o)}>{t("confirm")}</Button>}
      cancelLabel={t("cancel")}
    />
  );
}
