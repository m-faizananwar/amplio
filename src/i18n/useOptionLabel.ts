"use client";

import { useTranslations } from "next-intl";
import { optionKey } from "@/lib/option-key";

export type OptionGroup = "industries" | "regions";

// The label for a stored industry or region in the viewer's language; an
// unknown value (a new industry nobody has translated yet) shows as stored.
export function useOptionLabel(group: OptionGroup) {
  const t = useTranslations(`common.options.${group}`);
  return (value: string) => {
    const key = optionKey(value);
    return t.has(key) ? t(key) : value;
  };
}
