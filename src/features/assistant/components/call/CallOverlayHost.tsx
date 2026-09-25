"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { callSession } from "./callSession";

// The overlay renders nothing until a call starts, but its imports (metal-fx,
// thinking-orbs, the voice client) were loading with every app page anyway.
// They now arrive with the call.
const CallView = dynamic(() => import("./CallView").then((m) => m.CallView), { ssr: false });

type Props = { role: "brand" | "creator"; csrfToken?: string; account: React.ReactNode };

// Lives in the app layout: the call opens on /<role>/call and stays open while
// navigation intents change the route under it; End call clears the flag.
export function CallOverlayHost({ role, csrfToken, account }: Props) {
  const pathname = usePathname();
  const flagged = useSyncExternalStore(callSession.subscribe, callSession.isActive, () => false);
  const onCallRoute = pathname === `/${role}/call`;
  const previous = useRef(`/${role}`);
  useEffect(() => {
    if (onCallRoute) {
      if (!callSession.isActive()) callSession.start(previous.current);
    } else previous.current = pathname;
  }, [onCallRoute, pathname]);
  if (!onCallRoute && !flagged) return null;
  return <CallView role={role} csrfToken={csrfToken} account={account} />;
}
