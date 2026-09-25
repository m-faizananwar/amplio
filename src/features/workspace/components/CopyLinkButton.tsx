"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = { value: string; label: string; copied: string; failed: string; variant?: "primary" | "secondary"; size?: "default" | "sm" };

// Copies a link and says so, with a small ripple off the button; a blocked
// clipboard says how to copy by hand.
export function CopyLinkButton({ value, label, copied, failed, variant = "secondary", size = "default" }: Props) {
  // bumps per successful copy so the ripple replays
  const [ripples, setRipples] = useState(0);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setRipples((n) => n + 1);
      toast.success(copied);
    } catch {
      toast.error(failed);
    }
  }
  return (
    <span className="relative inline-flex">
      <Button type="button" variant={variant} size={size} onClick={copy}>
        <Copy aria-hidden="true" /> {label}
      </Button>
      {ripples > 0 ? <span key={ripples} aria-hidden="true" className="g-copied pointer-events-none absolute inset-0 rounded-control border border-ink" /> : null}
    </span>
  );
}
