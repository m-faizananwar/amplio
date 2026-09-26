import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import s from "./wizard.module.css";

// Back and forward, side by side: both are buttons (the forward one is the
// form's submit, passed as children).
export function WizardActions({ back, backLabel, children }: { back?: string; backLabel: string; children: ReactNode }) {
  return (
    <div className={s.actions}>
      {back ? <Link href={back} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11")}>{backLabel}</Link> : null}
      {children}
    </div>
  );
}
