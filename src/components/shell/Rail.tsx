"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { isActive, navFor, type NavItem, type Role } from "./nav";
import { useRailCollapsed } from "./useRailCollapsed";

type Props = { role: Role; onNavigate?: () => void; collapsible?: boolean };

const LEAVE_MS = 140;
const ARRIVE_MS = 520;

// The left rail on zinc-50: the mark, the seven destinations, Settings at the
// foot. Each item's icon sits in a 28px square; the active item is a white
// pill whose square pops in filled (src/styles/shell.css). On wide screens it
// folds to icons; the choice is remembered per browser.
export function Rail({ role, onNavigate, collapsible = false }: Props) {
  const pathname = usePathname();
  const t = useTranslations(`shell.nav`);
  const [collapsed, toggle] = useRailCollapsed();
  const folded = collapsible && collapsed;
  // Folding: the labels step aside first, then the rail narrows. Unfolding:
  // the rail widens, then the labels slide back in.
  const [phase, setPhase] = useState<"leaving" | "arriving" | null>(null);
  const fold = () => {
    if (folded) {
      toggle();
      setPhase("arriving");
      setTimeout(() => setPhase(null), ARRIVE_MS);
      return;
    }
    setPhase("leaving");
    setTimeout(() => { toggle(); setPhase(null); }, LEAVE_MS);
  };
  const nav = navFor(role);
  const root = `/${role}`;
  const item = (entry: NavItem) => {
    const active = isActive(pathname, entry.href, root);
    const label = t(`${role}.${entry.key}`);
    return (
      <li key={entry.href}>
        <Link href={entry.href} onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={folded ? label : undefined} data-tip={folded ? label : undefined} data-tip-side="right" className="nav-item">
          <span className="nav-icon"><entry.icon aria-hidden="true" /></span>
          {folded ? null : <span className="nav-label truncate">{label}</span>}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label={t("sectionLabel")} data-rail-collapsed={folded || undefined} data-rail-phase={phase ?? undefined} className="flex h-full flex-col gap-5 px-3 py-4">
      <Link href={root} onClick={onNavigate} className="flex h-10 items-center rounded-control px-2 outline-none focus-visible:ring-2 focus-visible:ring-money" aria-label={t(`${role}.overview`)}>
        <BrandLockup size="sm" wordClassName={folded ? "hidden" : undefined} />
      </Link>
      <div className="grid gap-1.5">
        {folded ? null : <p className="nav-section">{t("sections.main")}</p>}
        <ul className="grid gap-0.5">{nav.primary.map(item)}</ul>
      </div>
      <div className="mt-auto grid gap-1.5 border-t border-rule pt-3">
        {folded ? null : <p className="nav-section">{t("sections.account")}</p>}
        <ul className="grid gap-0.5" aria-label={t("accountLabel")}>{item(nav.settings)}</ul>
        {collapsible ? (
          <button type="button" onClick={fold} className="nav-item" aria-label={folded ? t("expand") : t("collapse")} data-tip={folded ? t("expand") : undefined} data-tip-side="right">
            <span className="nav-icon">{folded ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}</span>
            {folded ? null : <span className="nav-label truncate">{t("collapse")}</span>}
          </button>
        ) : null}
      </div>
    </nav>
  );
}
