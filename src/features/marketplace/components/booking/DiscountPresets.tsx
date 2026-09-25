"use client";

import { cn } from "@/lib/cn";
import { formatEuro } from "@/lib/format-euro";
import { DISCOUNT_PRESETS } from "../../constants";

const PERCENT = 100;

export function discountedCents(priceCents: number, percent: number) {
  return Math.round((priceCents * (PERCENT - percent)) / PERCENT);
}

type Props = { priceCents: number; value: string; onChange: (preset: string) => void };

// "Choose a discount": 10% / 20% / 30% computed from the list price, or Other.
export function DiscountPresets({ priceCents, value, onChange }: Props) {
  const options = [
    ...DISCOUNT_PRESETS.map((p) => ({ key: String(p), title: formatEuro(discountedCents(priceCents, p)), caption: `${p}% discount` })),
    { key: "other", title: "Other", caption: "Enter a price" },
  ];
  return (
    <div role="radiogroup" aria-label="Choose a discount" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              on ? "border-brand bg-brand/5" : "hover:bg-muted",
            )}
          >
            <span className="block text-sm font-semibold tabular-nums">{o.title}</span>
            <span className="block text-xs text-muted-foreground">{o.caption}</span>
          </button>
        );
      })}
    </div>
  );
}
