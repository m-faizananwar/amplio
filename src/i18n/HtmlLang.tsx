import type { Locale } from "./config";

// The root layout is shared by static and dynamic pages, so it can't read the
// locale without making every page dynamic. It ships lang="en";
// ClientMessages, which every area mounts, corrects it before the body paints.
export function HtmlLang({ locale }: { locale: Locale }) {
  return <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />;
}
