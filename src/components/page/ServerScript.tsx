"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => undefined;

// An inline script that belongs to the first paint of server HTML (the
// landing's entrance). When a client navigation mounts the same tree, the
// script would never run and React reports the <script> as an issue; the page
// is meant to render finished then, so nothing is rendered at all.
export function ServerScript({ code }: { code: string }) {
  // true on the server and while hydrating its HTML, false for a client-side mount
  const fromServer = useSyncExternalStore(noSubscribe, () => false, () => true);
  return fromServer ? <script dangerouslySetInnerHTML={{ __html: code }} /> : null;
}
