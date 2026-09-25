"use client";

import { useTranslations } from "next-intl";

// Wide screens only: the right pane before a thread is picked.
export function ThreadPlaceholder({ hasThreads }: { hasThreads: boolean }) {
  const t = useTranslations("collaboration.messages.empty.noSelection");
  if (!hasThreads) return null;
  return (
    <div className="grid flex-1 place-items-center p-8 text-center">
      <div>
        <p className="font-medium text-ink">{t("title")}</p>
        <p className="text-small text-ink-muted">{t("body")}</p>
      </div>
    </div>
  );
}
