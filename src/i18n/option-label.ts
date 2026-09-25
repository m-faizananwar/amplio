import "server-only";
import { getTranslations } from "next-intl/server";
import { optionKey } from "@/lib/option-key";
import type { OptionGroup } from "./useOptionLabel";

// Server twin of useOptionLabel, for server components.
export async function getOptionLabel(group: OptionGroup) {
  const t = await getTranslations(`common.options.${group}`);
  return (value: string) => {
    const key = optionKey(value);
    return t.has(key) ? t(key) : value;
  };
}
