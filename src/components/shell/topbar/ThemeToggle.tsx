"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { THEME_CHOICES } from "../theme/theme";
import { useTheme } from "../theme/useTheme";

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

// Light / dark / follow the system. Same control as the language switch, so
// the two sit side by side in the top bar and on the public nav.
export function ThemeToggle() {
  const t = useTranslations("common.theme");
  const { choice, choose } = useTheme();
  return (
    <SegmentedControl
      size="sm"
      label={t("label")}
      value={choice}
      onValueChange={choose}
      options={THEME_CHOICES.map((value) => {
        const Icon = ICONS[value];
        return {
          value,
          label: (
            <>
              <Icon className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{t(value)}</span>
            </>
          ),
        };
      })}
    />
  );
}
