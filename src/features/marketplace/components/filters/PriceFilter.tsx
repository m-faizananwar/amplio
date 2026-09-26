"use client";

import { ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pillClass } from "./pill-classes";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

const CENTS = 100;

type Props = { min?: number; max?: number; count: number };

// Price per post. The URL carries whole euros (?min=100); the query takes cents.
export function PriceFilter({ min, max, count }: Props) {
  const t = useTranslations("brand.creators.filters.price");
  const format = useFormatter();
  const { update } = useMarketplaceUrl();
  const [open, setOpen] = useState(false);
  const active = min !== undefined || max !== undefined;
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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

  const summary = active ? `${euros(min ?? 0)} – ${max !== undefined ? euros(max) : "∞"}` : t("label");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="chip" size="sm" className={pillClass(active)} />}>
        <span className={active ? "num" : undefined}>{summary}</span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form onSubmit={apply} className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <label htmlFor="price-min" className="text-caption font-medium">{t("min")}</label>
              <Input id="price-min" name="min" type="number" min={0} step={1} className="num" defaultValue={min !== undefined ? min / CENTS : ""} placeholder="20" />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="price-max" className="text-caption font-medium">{t("max")}</label>
              <Input id="price-max" name="max" type="number" min={0} step={1} className="num" defaultValue={max !== undefined ? max / CENTS : ""} placeholder="1500" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => { update({ min: undefined, max: undefined }); setOpen(false); }}>{t("clear")}</Button>
            <Button type="submit" size="sm">{t("apply", { count })}</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
