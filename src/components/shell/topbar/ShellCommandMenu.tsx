"use client";

import { Briefcase, Handshake, Languages, Moon, PhoneCall, Plus, Search, UserPlus, Users, Wallet, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { AgentMark } from "@/components/brand/AgentMark";
import { CommandMenu, useCommandShortcut, type CommandMenuGroup } from "@/components/ui/command-menu";
import type { CommandIndex } from "@/features/workspace/server/command-queries";
import { useCall } from "@/features/agent/components/call/callContext";
import { AGENT_MODE } from "@/features/agent/flag";
import { loadCommandIndex } from "@/features/workspace/server/actions";
import { setLocale } from "@/i18n/actions";
import { navFor, type Role } from "../nav";
import { useTheme } from "../theme/useTheme";

type Props = { role: Role };

// ⌘K from anywhere: pages, then the workspace's campaigns, collaborations and
// creators (fetched on first open), then actions.
export function ShellCommandMenu({ role }: Props) {
  const t = useTranslations("shell");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<CommandIndex | null>(null);
  const { resolved, choose } = useTheme();
  const toggleTheme = () => choose(resolved === "dark" ? "light" : "dark");
  const locale = useLocale();

  const show = useCallback((next: boolean) => {
    setOpen(next);
    if (next && !index) void loadCommandIndex().then(setIndex);
  }, [index]);
  const toggle = useCallback(() => show(!open), [open, show]);
  useCommandShortcut(toggle);

  const call = useCall();
  const go = (href: string) => () => router.push(href);
  const nav = navFor(role);
  const groups: CommandMenuGroup[] = [
    { heading: t("commandMenu.groups.goTo"), items: [...nav.primary, nav.settings].map((n) => ({ id: n.href, label: t(`nav.${role}.${n.key}`), icon: n.key === "agent" ? AgentMark : n.icon, onSelect: go(n.href) })) },
    { heading: t("commandMenu.groups.campaigns"), items: (index?.campaigns ?? []).map((e) => ({ id: e.id, label: e.label, icon: Briefcase, onSelect: go(e.href) })) },
    { heading: t("commandMenu.groups.collaborations"), items: (index?.collaborations ?? []).map((e) => ({ id: e.id, label: e.label, icon: Handshake, onSelect: go(e.href) })) },
    { heading: t("commandMenu.groups.creators"), items: (index?.creators ?? []).map((e) => ({ id: e.id, label: e.label, hint: e.hint, keywords: e.hint ? [e.hint] : undefined, icon: Users, onSelect: go(e.href) })) },
    { heading: t("commandMenu.groups.actions"), items: [
      ...(AGENT_MODE ? [{ id: "ask-agent", label: t("commandMenu.actions.askAgent"), icon: AgentMark, onSelect: go(`/${role}/agent`) }] : []),
      ...(call ? [{ id: "call-agent", label: t("commandMenu.actions.callAgent"), icon: PhoneCall, onSelect: call.start }] : []),
      ...(role === "brand" ? [
        { id: "new-campaign", label: t("commandMenu.actions.newCampaign"), icon: Plus, onSelect: go("/brand/campaigns/new") },
        { id: "invite", label: t("commandMenu.actions.inviteCreator"), icon: UserPlus, onSelect: go("/brand/creators") },
        { id: "top-up", label: t("commandMenu.actions.topUp"), icon: Wallet, onSelect: go("/brand/billing") },
        { id: "results", label: t("commandMenu.actions.openResults"), icon: BarChart3, onSelect: go("/brand/results") },
      ] : []),
      { id: "call", label: t("commandMenu.actions.call"), icon: PhoneCall, onSelect: go(`/${role}/call`) },
      { id: "theme", label: t("commandMenu.actions.toggleTheme"), icon: Moon, onSelect: toggleTheme },
      { id: "language", label: t("commandMenu.actions.switchLanguage"), icon: Languages, onSelect: () => void setLocale(locale === "en" ? "fr" : "en").then(() => router.refresh()) },
    ] },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => show(true)}
        aria-label={t("topBar.search")}
        className="field-control field-control--sm max-w-sm text-ink-muted max-[419px]:w-9 max-[419px]:justify-center max-[419px]:px-0"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        {/* under 420px the search is an icon button; its label stays for screen readers */}
        <span className="flex-1 truncate max-[419px]:sr-only">{t("topBar.search")}</span>
        <kbd className="num hidden rounded-[6px] bg-surface px-1.5 py-0.5 text-caption shadow-lift sm:inline">⌘K</kbd>
      </button>
      <CommandMenu open={open} onOpenChange={show} groups={groups} title={t("commandMenu.title")} placeholder={t("commandMenu.placeholder")} emptyText={t("commandMenu.empty")} />
    </>
  );
}
