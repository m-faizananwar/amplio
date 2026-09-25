"use client";

import { useFormatter, useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DISCOUNT_PRESETS } from "../../constants";

const PERCENT = 100;
const CENTS = 100;

export function discountedCents(priceCents: number, percent: number) {
  return Math.round((priceCents * (PERCENT - percent)) / PERCENT);
}

type Props = { priceCents: number; value: string; onChange: (preset: string) => void };

// 10 / 20 / 30 % below the listed price, or your own number.
export function DiscountPresets({ priceCents, value, onChange }: Props) {
  const t = useTranslations("brand.creators.booking.offer");
  const format = useFormatter();
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <SegmentedControl
      label={t("discount")}
      value={value}
      onValueChange={onChange}
      className="w-full [&>*]:flex-1"
      options={[
        ...DISCOUNT_PRESETS.map((p) => ({ value: String(p), label: <span className="num">{`−${p}% · ${euros(discountedCents(priceCents, p))}`}</span> })),
        { value: "other", label: t("other") },
      ]}
    />
  );
}
