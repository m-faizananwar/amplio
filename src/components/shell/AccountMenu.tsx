"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PersonAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CSRF_FIELD } from "@/features/auth/constants";
import { logout } from "@/features/auth/server/actions";
import { isThemeChoice, THEME_CHOICES } from "./theme/theme";
import { useTheme } from "./theme/useTheme";
import type { ShellViewer } from "./viewer";

// Avatar → who you are, Settings, the theme (the only place phones get it), Sign out (a real form POST with
// the session's CSRF token).
export function AccountMenu({ viewer }: { viewer: ShellViewer }) {
  const t = useTranslations("shell.topBar.account");
  const tTheme = useTranslations("common.theme");
  const { choice, choose } = useTheme();
  const name = `${viewer.firstName} ${viewer.lastName}`.trim();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={t("label")} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-money">
        <PersonAvatar name={name} src={viewer.avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid gap-0.5 py-2">
            <span className="truncate text-body font-medium text-ink">{name}</span>
            <span className="truncate text-caption font-normal text-ink-muted">{viewer.workspace}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={`/${viewer.role}/settings`} />}>
          <Settings aria-hidden="true" />
          {t("settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{tTheme("label")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={choice} onValueChange={(next: string) => { if (isThemeChoice(next)) choose(next); }}>
            {THEME_CHOICES.map((value) => (
              <DropdownMenuRadioItem key={value} value={value} closeOnClick={false}>{tTheme(value)}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {viewer.preview ? null : (
          <>
            <DropdownMenuSeparator />
            <form action={logout}>
              <input type="hidden" name={CSRF_FIELD} value={viewer.csrfToken} />
              <DropdownMenuItem nativeButton render={<button type="submit" className="w-full" />}>
                <LogOut aria-hidden="true" />
                {t("signOut")}
              </DropdownMenuItem>
            </form>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
