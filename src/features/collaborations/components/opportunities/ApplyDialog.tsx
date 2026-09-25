"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OpportunityDto } from "../../schemas";

type Props = { opportunity: OpportunityDto | null; onOpenChange: (open: boolean) => void; onConfirm: (o: OpportunityDto) => void };

const CENTS = 100;

// Applying is a commitment on the creator's own price, so it takes one confirm.
export function ApplyDialog({ opportunity: o, onOpenChange, onConfirm }: Props) {
  const t = useTranslations("creator.opportunities.applyDialog");
  const format = useFormatter();
  return (
    <Dialog open={o !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {o ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title", { campaign: o.campaignName })}</DialogTitle>
              <DialogDescription>{t("description", { brand: o.brandCompany })}</DialogDescription>
            </DialogHeader>
            <dl className="grid gap-2 rounded-control border border-rule bg-paper p-4 text-small">
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">{t("yourPrice")}</dt><dd className="num text-money">{format.number(o.listPriceCents / CENTS, { style: "currency", currency: "EUR" })}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">{t("deadline")}</dt><dd className="num text-ink">{o.postDeadline ? format.dateTime(new Date(o.postDeadline), { dateStyle: "medium" }) : t("noDeadline")}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-muted">{t("channel")}</dt><dd className="text-ink">{t("channelValue")}</dd></div>
            </dl>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
              <Button type="button" onClick={() => onConfirm(o)}>{t("confirm")}</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
