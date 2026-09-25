"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { setLocale } from "@/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/config";

// EN / FR. Sets the locale cookie, then re-renders the current page on the
// server in the new language — same URL, no reload.
export function LocaleToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common.language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <SegmentedControl
      size="sm"
      label={t("label")}
      value={locale}
      className={pending ? "opacity-70" : undefined}
      onValueChange={(next) => startTransition(async () => {
        if (!(await setLocale(next))) return;
        // The server sets lang on a full load; a refresh re-renders in place.
        document.documentElement.lang = next;
        router.refresh();
      })}
      options={LOCALES.map((code) => ({ value: code, label: <span aria-label={t(code)}>{code.toUpperCase()}</span> }))}
    />
  );
}
