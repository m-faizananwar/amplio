"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = { value: string; label: string; copied: string; failed: string; variant?: "primary" | "secondary"; size?: "default" | "sm" };

// Copies a link and says so; a blocked clipboard says how to copy by hand.
export function CopyLinkButton({ value, label, copied, failed, variant = "secondary", size = "default" }: Props) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copied);
    } catch {
      toast.error(failed);
    }
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={copy}>
      <Copy aria-hidden="true" /> {label}
    </Button>
  );
}
