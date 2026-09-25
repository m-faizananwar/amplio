"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Role } from "./nav";
import { Rail } from "./Rail";

// Below 1024px the rail lives in a sheet behind the menu button.
export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("shell.nav");
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label={t("sectionLabel")} />}>
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-rule bg-paper p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">{t("sectionLabel")}</SheetTitle>
        <Rail role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
