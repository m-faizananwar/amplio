"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACTIVITY_LABELS, ACTIVITY_WINDOWS, type ActivityWindow } from "../../constants";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

// naano's "Filters" pill: activity window (last public post), applied on "Apply".
export function ActivityFilter({ value }: { value: ActivityWindow }) {
  const { update } = useMarketplaceUrl();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ActivityWindow>(value);
  const active = value !== "any";
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(value);
      }}
    >
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm" className={cn("rounded-full", active && "border-brand bg-brand/5 text-brand hover:bg-brand/10 hover:text-brand")} />
        }
      >
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        {active ? `Active · ${ACTIVITY_LABELS[value]}` : "Filters"}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <fieldset className="grid gap-1">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</legend>
          {ACTIVITY_WINDOWS.map((window) => (
            <label key={window} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
              <input type="radio" name="activity" value={window} checked={draft === window} onChange={() => setDraft(window)} className="accent-brand" />
              {ACTIVITY_LABELS[window]}
            </label>
          ))}
        </fieldset>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              update({ activity: draft === "any" ? undefined : draft });
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
