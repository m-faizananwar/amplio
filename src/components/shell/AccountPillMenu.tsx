"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Ref } from "react";
import { CSRF_FIELD } from "@/features/auth/constants";
import { logout } from "@/features/auth/server/actions";
import { LocaleToggle } from "./topbar/LocaleToggle";
import { RoleSwitch } from "./topbar/RoleSwitch";
import { ThemeToggle } from "./topbar/ThemeToggle";
import type { ShellViewer } from "./viewer";

type Props = { ref: Ref<HTMLDivElement>; id: string; viewer: ShellViewer; open: boolean; onChoose: () => void };

// What the account pill turns into: the email, then Profile, Settings,
// Language, Theme and Sign out. Inert while the pill is closed.
export function AccountPillMenu({ ref, id, viewer, open, onChoose }: Props) {
  const t = useTranslations("shell.topBar.account");
  const tc = useTranslations("common");
  const tw = useTranslations("shell.topBar.roleSwitch");
  return (
    <div ref={ref} id={id} role="group" aria-label={t("menu")} className="account-pill-menu" inert={!open || undefined}>
      {viewer.email ? <p className="account-pill-email">{viewer.email}</p> : null}
      <Link data-pill-row href={viewer.role === "brand" ? "/brand/settings#company" : "/creator/card"} className="account-pill-row" onClick={onChoose}>
        <UserRound aria-hidden="true" />{t("profile")}
      </Link>
      <Link data-pill-row href={`/${viewer.role}/settings`} className="account-pill-row" onClick={onChoose}>
        <Settings aria-hidden="true" />{t("settings")}
      </Link>
      {/* the demo workspace switch lives in the top bar from xl up */}
      {viewer.demo ? <div className="account-pill-row account-pill-setting h-auto py-1 xl:hidden"><span>{tw("label")}</span><RoleSwitch role={viewer.role} /></div> : null}
      <div className="account-pill-row account-pill-setting"><span>{tc("language.label")}</span><LocaleToggle /></div>
      <div className="account-pill-row account-pill-setting"><span>{tc("theme.label")}</span><ThemeToggle /></div>
      {viewer.preview ? null : (
        <form action={logout} className="border-t border-rule pt-1">
          <input type="hidden" name={CSRF_FIELD} value={viewer.csrfToken} />
          <button data-pill-row type="submit" className="account-pill-row w-full">
            <LogOut aria-hidden="true" />{t("signOut")}
          </button>
        </form>
      )}
    </div>
  );
}
