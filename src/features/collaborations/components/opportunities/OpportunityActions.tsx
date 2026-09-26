"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { OpportunityDto } from "../../schemas";

type Props = { opportunity: OpportunityDto; pending: boolean; onApply: (o: OpportunityDto) => void; onBrief: (o: OpportunityDto) => void };

const CENTS = 100;

// What it pays and the two things to do. From md up the wrapper dissolves
// (md:contents) so price, brief and action land in the row's fixed columns
// and the prices form one line down the list, whatever the action says. The
// action column (17rem in the row) fits the longest label, FR "Voir la
// collaboration" (266px), so a button never runs back over "Read brief".
export function OpportunityActions({ opportunity: o, pending, onApply, onBrief }: Props) {
  const t = useTranslations("creator.opportunities.item");
  const format = useFormatter();
  return (
    <div className="flex flex-wrap items-center gap-2 md:contents">
      <span className="num mr-2 text-small text-money md:mr-0 md:text-right">{format.number(o.listPriceCents / CENTS, { style: "currency", currency: "EUR" })}</span>
      <Button type="button" variant="ghost" onClick={() => onBrief(o)}>{t("readBrief")}</Button>
      <div className="md:justify-self-end">
        {o.existingCollaborationId ? (
          <Link href={`/creator/collaborations/${o.existingCollaborationId}`} className={buttonVariants({ variant: "secondary" })}>{t("openCollaboration")}</Link>
        ) : (
          <Button type="button" onClick={() => onApply(o)} disabled={pending}>{pending ? t("applying") : t("apply")}</Button>
        )}
      </div>
    </div>
  );
}
