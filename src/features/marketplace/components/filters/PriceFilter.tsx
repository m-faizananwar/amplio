"use client";

import { ChevronDown } from "lucide-react";
import { type FormEvent, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

const CENTS = 100;

type Props = { min?: number; max?: number; count: number };

// Price pill: Min / Max in euros, "Show N creators" applies them.
export function PriceFilter({ min, max, count }: Props) {
  const { update } = useMarketplaceUrl();
  const [open, setOpen] = useState(false);
  const active = min !== undefined || max !== undefined;

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parse = (key: string) => {
      const raw = String(data.get(key) ?? "").trim();
      return raw === "" ? undefined : Math.max(0, Math.round(Number(raw)));
    };
    update({ min: parse("min"), max: parse("max") });
    setOpen(false);
  }

  const summary = active ? `${min !== undefined ? min / CENTS : 0} – ${max !== undefined ? `${max / CENTS} €` : "∞"}` : "Price";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm" className={cn("rounded-full", active && "border-brand bg-brand/5 text-brand hover:bg-brand/10 hover:text-brand")} />
        }
      >
        {summary}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form onSubmit={apply} className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="price-min" className="text-xs">Min (€)</Label>
              <Input id="price-min" name="min" type="number" min={0} step={1} defaultValue={min !== undefined ? min / CENTS : ""} placeholder="20" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="price-max" className="text-xs">Max (€)</Label>
              <Input id="price-max" name="max" type="number" min={0} step={1} defaultValue={max !== undefined ? max / CENTS : ""} placeholder="1500" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => { update({ min: undefined, max: undefined }); setOpen(false); }}>
              Clear
            </Button>
            <Button type="submit" size="sm">Show {count} creators</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
