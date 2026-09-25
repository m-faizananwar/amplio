import {
  BarChart3, Briefcase, CreditCard, Handshake, IdCard, LayoutGrid, LineChart, type LucideIcon, MessageCircle, Settings, Store, Users, Wallet,
} from "lucide-react";

export type Role = "brand" | "creator";
// `key` is the message key under shell.nav.<role>; labels never live here.
export type NavItem = { href: string; key: string; icon: LucideIcon };

// DIRECTION.md: Brand — Overview, Creators, Campaigns, Collaborations,
// Results, Messages, Billing. Creator — Overview, My card, Opportunities,
// Collaborations, Analytics, Earnings, Messages. Settings for both, at the
// foot of the rail. Integrations, Book a call and Invite are cut or merged.
const BRAND_NAV: NavItem[] = [
  { href: "/brand", key: "overview", icon: LayoutGrid },
  { href: "/brand/creators", key: "creators", icon: Users },
  { href: "/brand/campaigns", key: "campaigns", icon: Briefcase },
  { href: "/brand/collaborations", key: "collaborations", icon: Handshake },
  { href: "/brand/results", key: "results", icon: BarChart3 },
  { href: "/brand/messages", key: "messages", icon: MessageCircle },
  { href: "/brand/billing", key: "billing", icon: CreditCard },
];

const CREATOR_NAV: NavItem[] = [
  { href: "/creator", key: "overview", icon: LayoutGrid },
  { href: "/creator/card", key: "card", icon: IdCard },
  { href: "/creator/opportunities", key: "opportunities", icon: Store },
  { href: "/creator/collaborations", key: "collaborations", icon: Handshake },
  { href: "/creator/analytics", key: "analytics", icon: LineChart },
  { href: "/creator/earnings", key: "earnings", icon: Wallet },
  { href: "/creator/messages", key: "messages", icon: MessageCircle },
];

export function navFor(role: Role) {
  return {
    primary: role === "brand" ? BRAND_NAV : CREATOR_NAV,
    settings: { href: `/${role}/settings`, key: "settings", icon: Settings } satisfies NavItem,
  };
}

export function isActive(pathname: string, href: string, root: string) {
  return href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`);
}
