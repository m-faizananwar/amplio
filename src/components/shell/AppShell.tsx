import type { ReactNode } from "react";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ViewTransitions } from "@/components/motion/ViewTransitions";
import { CallOverlayHost } from "@/features/assistant/components/call/CallOverlayHost";
import { AccountMenu } from "./AccountMenu";
import { AssistantPill } from "./assistant/AssistantPill";
import { Sidebar } from "./Sidebar";
import { SidebarFrame } from "./SidebarFrame";
import { TopBar } from "./TopBar";
import type { ShellViewer } from "./viewer";
import { WalletProvider } from "./WalletProvider";

export function AppShell({ viewer, children }: { viewer: ShellViewer; children: ReactNode }) {
  return (
    <WalletProvider initialCents={viewer.walletCents}>
    <div className="flex min-h-screen bg-muted/40">
      <SidebarFrame role={viewer.role}>
        <Sidebar viewer={viewer} />
      </SidebarFrame>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar viewer={viewer} />
        {/* Bottom padding keeps the floating assistant pill off the last row of content on small screens. */}
        {/* vt-main names the page area for the route crossfade; the shell around it stays put. */}
        <main className="vt-main flex-1 px-4 pt-6 pb-24 lg:px-8 lg:pt-8">
          {/* Grid/flex items default to min-width:auto, which lets a wide table stretch the page; wide content must scroll inside its own container. */}
          <div className="mx-auto w-full min-w-0 max-w-6xl [&_.grid>*]:min-w-0 [&_.flex>*]:min-w-0"><RouteTransition>{children}</RouteTransition></div>
        </main>
      </div>
      <ViewTransitions />
      <AssistantPill role={viewer.role} workspace={viewer.workspace} csrfToken={viewer.csrfToken} />
      <CallOverlayHost role={viewer.role} csrfToken={viewer.csrfToken} account={<AccountMenu viewer={viewer} />} />
    </div>
    </WalletProvider>
  );
}
