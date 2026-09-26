import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ViewTransitions } from "@/components/motion/ViewTransitions";
import { AgentCallProvider } from "@/features/agent/components/call/AgentCallProvider";
import { AGENT_MODE } from "@/features/agent/flag";
import { CallOverlayHost } from "@/features/assistant/components/call/CallOverlayHost";
import { ClientMessages } from "@/i18n/ClientMessages";
import { AccountMenu } from "./AccountMenu";
import { AccountPill } from "./AccountPill";
import { AssistantPill } from "./assistant/AssistantPill";
import { Rail } from "./Rail";
import { SlidingTooltip } from "./SlidingTooltip";
import { TopBar } from "./TopBar";
import type { ShellViewer } from "./viewer";
import { WalletProvider } from "./WalletProvider";

// The signed-in frame: a fixed rail (232px, lg and up), the top bar, and the
// page in a 1200px column. Client copy for the shell and the role's pages is
// sent once here, not per page.
// the rail's Setup item and its badge, only while setup is unfinished
function railSetup(viewer: ShellViewer) {
  return viewer.setup && !viewer.setup.finished ? { done: viewer.setup.done, total: viewer.setup.total } : null;
}

// the agent's call, around the whole frame so no route change drops it
function CallLayer({ role, csrfToken, children }: { role: ShellViewer["role"]; csrfToken: string; children: ReactNode }) {
  return AGENT_MODE ? <AgentCallProvider role={role} csrfToken={csrfToken}>{children}</AgentCallProvider> : <>{children}</>;
}

export async function AppShell({ viewer, children }: { viewer: ShellViewer; children: ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <ClientMessages namespaces={["shell", viewer.role, "settings", "collaboration", "agent"]}>
      <WalletProvider initialCents={viewer.walletCents}>
        <CallLayer role={viewer.role} csrfToken={viewer.csrfToken}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">{t("skipToContent")}</a>
        <div className="font-app flex min-h-screen bg-paper">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-rule bg-paper transition-[width] duration-(--duration-slow) ease-ledger has-[[data-rail-collapsed]]:w-18 lg:block">
            <Rail role={viewer.role} collapsible setup={railSetup(viewer)} account={<AccountPill viewer={viewer} place="rail" />} />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar viewer={viewer} />
            {/* vt-main names the page area for the route crossfade; bottom padding keeps the assistant pill off the last row. */}
            <main id="main" className="vt-main flex-1 px-4 pt-8 pb-24 lg:px-8">
              <div className="mx-auto w-full min-w-0 max-w-content [&_.grid>*]:min-w-0 [&_.flex>*]:min-w-0"><RouteTransition>{children}</RouteTransition></div>
            </main>
          </div>
          <ViewTransitions />
          <SlidingTooltip />
          <AssistantPill role={viewer.role} workspace={viewer.workspace} csrfToken={viewer.csrfToken} />
          <CallOverlayHost role={viewer.role} csrfToken={viewer.csrfToken} account={<AccountMenu viewer={viewer} />} />
        </div>
        </CallLayer>
      </WalletProvider>
    </ClientMessages>
  );
}
