"use client";

import { Fragment } from "react";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isActive, navFor } from "./nav";
import { CallNavItem } from "./CallNavItem";
import { SlidingIndicator } from "@/components/motion/SlidingIndicator";

type Props = { role: "brand" | "creator"; section: "primary" | "secondary"; onNavigate?: () => void };

// Resolves the nav on the client so icon components never cross the RSC boundary as props.
const NAV_STAGGER_COUNT = 4;

export function SidebarNav({ role, section, onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const root = `/${role}`;
  const items = navFor(role)[section];
  return (
    // The capsule sits behind the items and slides to the active one; hovering
    // another item previews where it would land.
    <SlidingIndicator axis="y" variant="capsule">
    <ul className="grid gap-0.5">
      {items.map((item, index) => {
        const active = isActive(pathname, item.href, root);
        // first-mount entrance: the MotionSites nav stagger on the first four items
        const entrance = index < NAV_STAGGER_COUNT ? `nav-link-${index + 1}` : undefined;
        return (
          <Fragment key={item.href}>
          <li className={entrance}>
            <Link
              href={item.href}
              onClick={onNavigate}
              // warm the route on intent so the click swaps instantly
              onPointerEnter={() => router.prefetch(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                active && "text-brand hover:text-brand",
              )}
            >
              <span className="icon-chip -m-1 inline-flex rounded-full p-1" aria-hidden="true"><item.icon className="size-4 shrink-0" /></span>
              <span className="side-label truncate">{item.label}</span>
            </Link>
          </li>
          {item.label === "Messages" ? <CallNavItem role={role} onNavigate={onNavigate} /> : null}
          </Fragment>
        );
      })}
    </ul>
    </SlidingIndicator>
  );
}
