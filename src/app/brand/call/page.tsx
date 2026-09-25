import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BRAND } from "@/config/brand";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.assistant.callMode");
  return { title: `${t("title")} · ${BRAND.wordmark}` };
}

// The call itself is the CallOverlayHost in the app layout (it survives route
// changes under it); this page only gives the route a document.
export default async function BrandCallPage() {
  const t = await getTranslations("common.assistant.callMode");
  return <h1 className="sr-only">{t("title")}</h1>;
}
