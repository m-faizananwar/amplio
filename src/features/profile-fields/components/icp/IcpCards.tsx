"use client";

import { useRef, useState } from "react";
import { type Control, useController, useFormState } from "react-hook-form";
import type { ProfileInput } from "@/features/brand-onboarding/schemas";
import { IcpCard } from "./IcpCard";
import { IcpDialog } from "./IcpDialog";
import s from "./icp.module.css";

// The three ideal customers as summary cards; each opens the detail dialog,
// which writes all three back into the form on Save. Focus returns to the
// card the dialog was on when it closes.
export function IcpCards({ control }: { control: Control<ProfileInput> }) {
  const { field } = useController({ control, name: "icps" });
  const { errors } = useFormState({ control, name: "icps" });
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const icps = field.value;
  return (
    <>
      <div className={s.cards}>
        {icps.map((icp, i) => (
          <IcpCard
            key={i}
            ref={(el) => { cards.current[i] = el; }}
            n={i + 1}
            title={icp.title}
            description={icp.description}
            invalid={!!errors.icps?.[i]}
            onOpen={() => setOpen(i)}
          />
        ))}
      </div>
      {open !== null ? (
        <IcpDialog
          icps={icps}
          start={open}
          origin={(i) => cards.current[i] ?? null}
          onSave={(next) => field.onChange(next)}
          onClose={(i) => { setOpen(null); cards.current[i]?.focus(); }}
        />
      ) : null}
    </>
  );
}
