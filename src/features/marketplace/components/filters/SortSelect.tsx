"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS, type SortKey } from "../../constants";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

export function SortSelect({ value }: { value: SortKey }) {
  const t = useTranslations("brand.creators.filters.sort");
  const { update } = useMarketplaceUrl();
  const items = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, t(`options.${o.value}`)]));
  return (
    <div className="flex items-center gap-2">
      <span id="sort-label" className="text-caption text-ink-muted">{t("label")}</span>
      <Select value={value} items={items} onValueChange={(next) => update({ sort: next === "best" ? undefined : String(next) })}>
        <SelectTrigger aria-labelledby="sort-label" size="sm" className="min-w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{t(`options.${o.value}`)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
