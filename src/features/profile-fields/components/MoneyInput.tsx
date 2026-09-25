"use client";

import { Input } from "@/components/ui/input";
import { CENTS_PER_EURO } from "@/features/creator-onboarding/constants";

type Props = { id: string; cents: number; onCents: (cents: number) => void; invalid?: boolean; describedBy?: string; min?: number };

// A euro amount typed in whole euros, stored in cents (money is integer cents).
export function MoneyInput({ id, cents, onCents, invalid, describedBy, min = 0 }: Props) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">€</span>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={1}
        className="num pl-7"
        value={Number.isFinite(cents) ? cents / CENTS_PER_EURO : ""}
        onChange={(e) => onCents(Math.round(Number(e.target.value) * CENTS_PER_EURO))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}
