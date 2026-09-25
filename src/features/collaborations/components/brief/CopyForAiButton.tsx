"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { type BriefDoc, briefToAiPrompt } from "@/lib/brief-markdown";
import { useCopyToClipboard } from "./useCopyToClipboard";

export function CopyForAiButton({ brief }: { brief: BriefDoc }) {
  const t = useTranslations("collaboration.briefDrawer");
  const copy = useCopyToClipboard();
  return (
    <Button type="button" onClick={() => copy(briefToAiPrompt(brief), t("copiedForAi"))}>
      <Sparkles aria-hidden="true" />
      {t("copyForAi")}
    </Button>
  );
}
