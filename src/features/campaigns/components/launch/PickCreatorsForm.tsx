"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { DEFAULT_SELECTED_CREATORS } from "../../constants";
import type { CreatorPickDto } from "../../schemas";
import { CreatorRow } from "../detail/CreatorRow";

type Props = { campaignId: string; creators: CreatorPickDto[]; walletCents: number; backHref: string };
const CENTS = 100;

// The best-fit creators for this brief, the top few ticked. The selection
// travels to the review step in the URL; nothing is written until launch.
export function PickCreatorsForm({ campaignId, creators, walletCents, backHref }: Props) {
  const t = useTranslations("brand.campaigns.launch.pick");
  const format = useFormatter();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(creators.slice(0, DEFAULT_SELECTED_CREATORS).map((c) => c.id)));
  const total = creators.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.priceCents, 0);
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  const toggle = (id: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(`/brand/campaigns/${campaignId}/launch?step=review&creators=${[...selected].join(",")}`); }} className="grid gap-4">
      {creators.length === 0 ? (
        <EmptyState size="compact" title={t("empty.title")} body={t("empty.body")} action={<Link href={backHref} className={buttonVariants({ variant: "secondary" })}>{t("empty.action")}</Link>} />
      ) : (
        <ul className="divide-y divide-rule rounded-card border border-rule bg-surface px-5">
          {creators.map((creator) => (
            <li key={creator.id}>
              <CreatorRow creator={creator} leading={<Checkbox id={`pick-${creator.id}`} checked={selected.has(creator.id)} onCheckedChange={() => toggle(creator.id)} aria-label={t("select", { name: creator.name })} />} />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`num text-small ${total > walletCents ? "text-attention" : "text-ink-muted"}`}>{t("summary", { count: selected.size, total: euros(total), wallet: euros(walletCents) })}</p>
        <div className="flex gap-2">
          <Link href={backHref} className={buttonVariants({ variant: "ghost" })}>{t("back")}</Link>
          <Button type="submit">{t("review")}</Button>
        </div>
      </div>
    </form>
  );
}
