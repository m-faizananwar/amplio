"use client";

import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { useAgentMode } from "@/features/assistant/components/agentMode";

// "Call Amplio" under Messages, only while Agent mode is on.
export function CallNavItem({ role, onNavigate }: { role: "brand" | "creator"; onNavigate?: () => void }) {
  const [on] = useAgentMode();
  const pathname = usePathname();
  if (!on) return null;
  const href = `/${role}/call`;
  const active = pathname === href;
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          active && "text-brand hover:text-brand",
        )}
      >
        <span className="icon-chip -m-1 inline-flex rounded-full p-1" aria-hidden="true"><PhoneCall className="size-4 shrink-0" /></span>
        <span className="side-label truncate">Call Amplio</span>
      </Link>
    </li>
  );
}
