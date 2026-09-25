"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignOptionDto } from "../../schemas";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

type Props = { campaigns: CampaignOptionDto[]; selected: CampaignOptionDto | null };

// Every fit score on the page is computed against this campaign's brief.
export function CampaignSelector({ campaigns, selected }: Props) {
  const t = useTranslations("brand.creators");
  const { update } = useMarketplaceUrl();
  if (campaigns.length === 0) return null;
  const items = Object.fromEntries(campaigns.map((c) => [c.id, c.name]));
  return (
    <div className="flex items-center gap-2">
      <span id="campaign-label" className="text-caption text-ink-muted">{t("fitFor")}</span>
      <Select value={selected?.id ?? campaigns[0].id} items={items} onValueChange={(next) => update({ campaign: String(next) }, { keepPage: true })}>
        <SelectTrigger aria-labelledby="campaign-label" size="sm" className="max-w-64"><SelectValue /></SelectTrigger>
        <SelectContent>
          {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
