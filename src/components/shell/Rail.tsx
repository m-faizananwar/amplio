"use client";

import { ListChecks, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { RailCallControl } from "@/features/agent/components/call/widget/RailCallControl";
import { isActive, navFor, type NavItem, type Role } from "./nav";
import { useRailCollapsed } from "./useRailCollapsed";

export type RailSetup = { done: number; total: number } | null;
type Props = { role: Role; onNavigate?: () => void; collapsible?: boolean; account?: ReactNode; setup?: RailSetup };

const LEAVE_MS = 140;
const ARRIVE_MS = 520;

// The left rail on zinc-50: the mark with the fold button beside it, the
// destinations, then Settings and the account pill at the foot. Each item's icon sits in a 28px square; the active item is a white
// pill whose square pops in filled (src/styles/shell.css). On wide screens it
// folds to icons; the choice is remembered per browser.
export function Rail({ role, onNavigate, collapsible = false, account, setup = null }: Props) {
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
  const item = (entry: NavItem, badge?: string) => {
    const active = isActive(pathname, entry.href, root);
    const label = t(`${role}.${entry.key}`);
    // the Agent item carries the call: a phone to start one, the live time during one
    const agent = entry.key === "agent";
    return (
      <li key={entry.href} className={agent ? "relative" : undefined}>
        <Link href={entry.href} onClick={onNavigate} aria-current={active ? "page" : undefined} aria-label={folded ? label : undefined} data-tip={folded ? label : undefined} data-tip-side="right" className={agent && !folded ? "nav-item pr-20" : "nav-item"}>
          <span className="nav-icon"><entry.icon aria-hidden="true" /></span>
          {folded ? null : <span className="nav-label truncate">{label}</span>}
          {badge && !folded ? <span className="num ml-auto rounded-chip bg-money-soft px-1.5 py-0.5 text-caption font-semibold text-money">{badge}</span> : null}
        </Link>
        {agent ? <RailCallControl folded={folded} /> : null}
      </li>
    );
  };
  return (
    <nav aria-label={t("sectionLabel")} data-rail-collapsed={folded || undefined} data-rail-phase={phase ?? undefined} className="flex h-full flex-col gap-5 px-3 py-4">
      <div className={folded ? "grid justify-items-center gap-2" : "flex items-center justify-between gap-2"}>
        <Link href={root} onClick={onNavigate} className="flex h-10 items-center rounded-control px-2 outline-none focus-visible:ring-2 focus-visible:ring-money" aria-label={t(`${role}.overview`)}>
          <BrandLockup size="sm" wordClassName={folded ? "hidden" : undefined} />
        </Link>
        {collapsible ? (
          <button type="button" onClick={fold} className="grid size-8 shrink-0 place-items-center rounded-control text-ink-muted outline-none transition-colors duration-(--duration-fast) hover:bg-well hover:text-ink focus-visible:ring-2 focus-visible:ring-money" aria-label={folded ? t("expand") : t("collapse")} data-tip={folded ? t("expand") : t("collapse")} data-tip-side="right">
            {folded ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        {folded ? null : <p className="nav-section">{t("sections.main")}</p>}
        <ul className="grid gap-0.5">
          {/* setup sits on top only while it is unfinished, with its progress as a badge */}
          {setup ? item({ href: `/${role}/setup`, key: "setup", icon: ListChecks }, `${setup.done}/${setup.total}`) : null}
          {nav.primary.map((e) => item(e))}
        </ul>
      </div>
      <div className="mt-auto grid gap-1.5 border-t border-rule pt-3">
        {folded ? null : <p className="nav-section">{t("sections.account")}</p>}
        <ul className="grid gap-0.5" aria-label={t("accountLabel")}>{item(nav.settings)}</ul>
        {account ? <div className="pt-2">{account}</div> : null}
      </div>
    </nav>
  );
}
