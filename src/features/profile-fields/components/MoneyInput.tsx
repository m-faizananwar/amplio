"use client";

import { Input } from "@/components/ui/input";
import { CENTS_PER_EURO } from "@/features/creator-onboarding/constants";
import { Euro } from "lucide-react";

type Props = { id: string; cents: number; onCents: (cents: number) => void; invalid?: boolean; describedBy?: string; min?: number; placeholder?: string };

// A euro amount typed in whole euros, stored in cents (money is integer cents).
export function MoneyInput({ id, cents, onCents, invalid, describedBy, min = 0, placeholder }: Props) {
  return (
    <div>
      <Input
        id={id}
        leadingIcon={<Euro />}
        type="number"
        inputMode="decimal"
        min={min}
        step={1}
        className="num"
        placeholder={placeholder}
        value={Number.isFinite(cents) ? cents / CENTS_PER_EURO : ""}
        onChange={(e) => onCents(Math.round(Number(e.target.value) * CENTS_PER_EURO))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}
