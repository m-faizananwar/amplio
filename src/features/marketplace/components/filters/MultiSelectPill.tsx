"use client";

import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { pillClass } from "./pill-classes";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PillOption = { value: string; label: string; hint?: string };

type Props = {
  label: string;
  options: PillOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchPlaceholder: string;
};

// A searchable multi-select filter pill (Industry, Country).
export function MultiSelectPill({ label, options, selected, onChange, searchPlaceholder }: Props) {
  const t = useTranslations("brand.creators.filters");
  const active = selected.length > 0;
  const toggle = (value: string) => onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="secondary" size="sm" className={pillClass(active)} />
        }
      >
        {label}
        {active ? <span className="num rounded-chip bg-ink px-1.5 text-caption text-paper">{selected.length}</span> : null}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>{t("noMatch")}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)} aria-selected={on}>
                    <span className={cn("flex size-4 items-center justify-center rounded border", on && "border-ink bg-ink text-paper")}>
                      {on ? <Check className="size-3" aria-hidden="true" /> : null}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.hint ? <span className="num text-caption text-ink-muted">{o.hint}</span> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {active ? (
          <div className="border-t p-1.5">
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => onChange([])}>
              {t("clear")}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
