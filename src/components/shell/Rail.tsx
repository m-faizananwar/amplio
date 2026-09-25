"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";
import { cn } from "@/lib/cn";
import { isActive, navFor, type NavItem, type Role } from "./nav";

type Props = { role: Role; onNavigate?: () => void };

// The left rail: the mark, the seven destinations, Settings at the foot. The
// active item carries aria-current; the shared capsule slides to it.
export function Rail({ role, onNavigate }: Props) {
  const pathname = usePathname();
  const t = useTranslations(`shell.nav`);
  const nav = navFor(role);
  const root = `/${role}`;
  const item = (entry: NavItem) => {
    const active = isActive(pathname, entry.href, root);
    return (
      <li key={entry.href}>
        <Link
          href={entry.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex h-9 items-center gap-3 rounded-control px-3 text-body text-ink-muted outline-none transition-colors duration-(--duration-fast) ease-ledger hover:text-ink focus-visible:ring-3 focus-visible:ring-ink/15",
            active && "font-medium text-ink",
          )}
        >
          <entry.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t(`${role}.${entry.key}`)}</span>
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label={t("sectionLabel")} className="flex h-full flex-col gap-6 px-3 py-4">
      <Link href={root} onClick={onNavigate} className="flex h-9 items-center rounded-control px-3 outline-none focus-visible:ring-3 focus-visible:ring-ink/15" aria-label={t(`${role}.overview`)}>
        <BrandLockup size="sm" />
      </Link>
      <SlidingIndicator axis="y" variant="capsule">
        <ul className="grid gap-0.5">{nav.primary.map(item)}</ul>
      </SlidingIndicator>
      <div className="mt-auto border-t border-rule pt-3">
        <SlidingIndicator axis="y" variant="capsule">
          <ul className="grid gap-0.5" aria-label={t("accountLabel")}>{item(nav.settings)}</ul>
        </SlidingIndicator>
      </div>
    </nav>
  );
}
