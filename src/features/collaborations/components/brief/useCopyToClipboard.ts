"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

// Clipboard write with a toast either way; the drawer's two copy buttons share it.
export function useCopyToClipboard() {
  const t = useTranslations("collaboration.briefDrawer");
  return useCallback(async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error(t("copyBlocked"));
    }
  }, [t]);
}
