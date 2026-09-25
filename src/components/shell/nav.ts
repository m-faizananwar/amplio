import {
  BarChart3, Briefcase, CalendarCheck, CreditCard, Handshake, IdCard, LayoutGrid, Layers, LineChart,
  type LucideIcon, MessageCircle, Plug, Settings, Store, UserPlus, Users, Wallet,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Brand sidebar, exactly as the product map lists it. The account menu shows the
// same secondary items (Invite Creators · Book a call · Integrations · Settings · Sign out).
export const BRAND_NAV: NavItem[] = [
  { href: "/brand", label: "Overview", icon: LayoutGrid },
  { href: "/brand/creators", label: "Creators", icon: Users },
  { href: "/brand/campaigns", label: "Campaigns", icon: Briefcase },
  { href: "/brand/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/brand/results", label: "Results", icon: BarChart3 },
  { href: "/brand/messages", label: "Messages", icon: MessageCircle },
  { href: "/brand/billing", label: "Billing", icon: CreditCard },
];
export const BRAND_SECONDARY_NAV: NavItem[] = [
  { href: "/brand/invite", label: "Invite Creators", icon: UserPlus },
  { href: "/brand/book-a-call", label: "Book a call", icon: CalendarCheck },
  { href: "/brand/integrations", label: "Integrations", icon: Plug },
  { href: "/brand/settings", label: "Settings", icon: Settings },
];

export const CREATOR_NAV: NavItem[] = [
  { href: "/creator", label: "Overview", icon: LayoutGrid },
  { href: "/creator/card", label: "My card", icon: IdCard },
  { href: "/creator/opportunities", label: "Opportunities", icon: Store },
  { href: "/creator/collaborations", label: "Collaborations", icon: Layers },
  { href: "/creator/analytics", label: "Analytics", icon: LineChart },
  { href: "/creator/earnings", label: "Earnings", icon: Wallet },
  { href: "/creator/messages", label: "Messages", icon: MessageCircle },
];
export const CREATOR_ACCOUNT_NAV: NavItem[] = [
  { href: "/creator/settings", label: "Settings", icon: Settings },
];

export function navFor(role: "brand" | "creator") {
  return role === "brand"
    ? { primary: BRAND_NAV, secondary: BRAND_SECONDARY_NAV, account: BRAND_SECONDARY_NAV }
    : { primary: CREATOR_NAV, secondary: [], account: CREATOR_ACCOUNT_NAV };
}

export function isActive(pathname: string, href: string, root: string) {
  return href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`);
}
