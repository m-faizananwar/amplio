"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMarketplaceUrl } from "./useMarketplaceUrl";

const DEBOUNCE_MS = 350;

export function SearchInput({ initial }: { initial: string }) {
  const t = useTranslations("brand.creators.filters");
  const { update } = useMarketplaceUrl();
  const [value, setValue] = useState(initial);

  // The parent keys this input on the URL's q, so an external change remounts it.
  useEffect(() => {
    if (value === initial) return;
    const timer = setTimeout(() => update({ q: value.trim() }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, initial, update]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="creator-search" className="sr-only">{t("search")}</label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <Input id="creator-search" type="search" placeholder={t("searchPlaceholder")} value={value} onChange={(e) => setValue(e.target.value)} className="pl-9" />
    </div>
  );
}
