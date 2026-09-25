"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BriefDto } from "../../schemas";
import { BriefDrawer } from "./BriefDrawer";

type Props = { brief: BriefDto; label?: string; variant?: "primary" | "secondary" | "ghost"; className?: string };

// The "Read brief" button and the drawer it opens, in one client island.
export function ViewBriefButton({ brief, label, variant = "secondary", className }: Props) {
  const t = useTranslations("collaboration.briefDrawer");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>
        <FileText aria-hidden="true" />
        {label ?? t("viewBrief")}
      </Button>
      <BriefDrawer brief={brief} open={open} onOpenChange={setOpen} />
    </>
  );
}
