"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "./config";

const noSubscribe = () => () => undefined;

// The root layout is shared by static and dynamic pages, so it can't read the
// locale without making every page dynamic. It ships lang="en";
// ClientMessages, which every area mounts, corrects it. In server HTML an
// inline script does it before the body paints; when a client navigation
// mounts a new area, a <script> would never run (and React flags it as an
// issue), so the effect sets it instead and no script is rendered.
export function HtmlLang({ locale }: { locale: Locale }) {
  // true while rendering on the server and hydrating that HTML, false for a client-side mount
  const fromServer = useSyncExternalStore(noSubscribe, () => false, () => true);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return fromServer ? <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} /> : null;
}
