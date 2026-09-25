"use client";

import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";

type Props = {
  acceptLabel: string;
  declineLabel: string;
  declineConfirm: string;
  declineWarning: string;
  disabled: boolean;
  onDecide: (decision: "accept" | "decline") => void;
};

// Accept is one click; decline closes the collaboration for good, so it takes
// two (the danger button arms, then confirms) and says what it costs.
export function DecisionButtons({ acceptLabel, declineLabel, declineConfirm, declineWarning, disabled, onDecide }: Props) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={disabled} onClick={() => onDecide("accept")}>{acceptLabel}</Button>
        <ConfirmButton confirmLabel={declineConfirm} disabled={disabled} onConfirm={() => onDecide("decline")}>{declineLabel}</ConfirmButton>
      </div>
      <p className="text-caption text-ink-muted">{declineWarning}</p>
    </div>
  );
}
