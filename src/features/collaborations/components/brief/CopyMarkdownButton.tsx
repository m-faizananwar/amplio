"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { type BriefDoc, briefToMarkdown } from "@/lib/brief-markdown";
import { useCopyToClipboard } from "./useCopyToClipboard";

export function CopyMarkdownButton({ brief }: { brief: BriefDoc }) {
  const t = useTranslations("collaboration.briefDrawer");
  const copy = useCopyToClipboard();
  return (
    <Button type="button" variant="secondary" onClick={() => copy(briefToMarkdown(brief), t("copiedMarkdown"))}>
      <Copy aria-hidden="true" />
      {t("copyMarkdown")}
    </Button>
  );
}
