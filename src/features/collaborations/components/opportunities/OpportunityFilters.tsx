"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type OpportunityFilterState = { query: string; industry: string; region: string; sort: "relevance" | "deadline" | "brand" };
export const ALL = "all";
export const INITIAL_FILTERS: OpportunityFilterState = { query: "", industry: ALL, region: ALL, sort: "relevance" };

type Props = { value: OpportunityFilterState; onChange: (next: OpportunityFilterState) => void; industries: string[]; regions: string[]; count: number };

function Pick({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; all?: string }) {
  // Base UI renders the chosen label from `items`; without it the trigger shows the raw value.
  const items = [...(all ? [{ value: ALL, label: all }] : []), ...options];
  return (
    <Select items={items} value={value} onValueChange={(v) => onChange(String(v))}>
      <SelectTrigger className="w-full sm:w-44" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>
        {items.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// Search, two filters and the sort, then how many campaigns are left.
export function OpportunityFilters({ value, onChange, industries, regions, count }: Props) {
  const t = useTranslations("creator.opportunities");
  const set = (patch: Partial<OpportunityFilterState>) => onChange({ ...value, ...patch });
  const dirty = value.query !== "" || value.industry !== ALL || value.region !== ALL || value.sort !== "relevance";
  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <Input type="search" value={value.query} onChange={(e) => set({ query: e.target.value })} placeholder={t("filters.searchPlaceholder")} aria-label={t("filters.search")} className="pl-9" />
        </div>
        <Pick label={t("filters.industry")} value={value.industry} onChange={(industry) => set({ industry })} options={industries.map((i) => ({ value: i, label: i }))} all={t("filters.industryAll")} />
        <Pick label={t("filters.region")} value={value.region} onChange={(region) => set({ region })} options={regions.map((r) => ({ value: r, label: r }))} all={t("filters.regionAll")} />
        <Pick label={t("filters.sort")} value={value.sort} onChange={(sort) => set({ sort: sort as OpportunityFilterState["sort"] })} options={[{ value: "relevance", label: t("filters.sortFit") }, { value: "deadline", label: t("filters.sortDeadline") }, { value: "brand", label: t("filters.sortBrand") }]} />
      </div>
      <div className="flex items-center justify-between">
        <p className="num text-small text-ink-muted" aria-live="polite">{t("resultCount", { count })}</p>
        {dirty ? <Button type="button" variant="ghost" size="sm" onClick={() => onChange(INITIAL_FILTERS)}>{t("filters.reset")}</Button> : null}
      </div>
    </div>
  );
}
