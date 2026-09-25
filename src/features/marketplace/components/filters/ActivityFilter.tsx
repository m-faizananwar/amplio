"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ACTIVITY_WINDOWS, type ActivityWindow } from "../../constants";
import { pillClass } from "./pill-classes";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

// Activity: only creators with a public post in the window. Applied on "Apply"
// so the list doesn't jump while you choose.
export function ActivityFilter({ value }: { value: ActivityWindow }) {
  const t = useTranslations("brand.creators.filters.activity");
  const { update } = useMarketplaceUrl();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ActivityWindow>(value);
  const active = value !== "any";
  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) setDraft(value); }}>
      <PopoverTrigger render={<Button type="button" variant="secondary" size="sm" className={pillClass(active)} />}>
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        {active ? t("active", { window: t(`windows.${value}`) }) : t("label")}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-3">
        <p className="text-caption text-ink-muted">{t("legend")}</p>
        <SegmentedControl size="sm" label={t("legend")} value={draft} onValueChange={setDraft} options={ACTIVITY_WINDOWS.map((w) => ({ value: w, label: t(`windows.${w}`) }))} />
        <Button type="button" size="sm" className="justify-self-end" onClick={() => { update({ activity: draft === "any" ? undefined : draft }); setOpen(false); }}>{t("apply")}</Button>
      </PopoverContent>
    </Popover>
  );
}
