import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LaunchClosing } from "@/features/public/components/launch/LaunchClosing";
import { LaunchHero } from "@/features/public/components/launch/LaunchHero";
import { LaunchMotion } from "@/features/public/components/launch/LaunchMotion";
import { LaunchScenes } from "@/features/public/components/launch/LaunchScenes";
import { PublicAssistantPill } from "@/features/public/components/nav/PublicAssistantPill";
import { PublicFooter } from "@/features/public/components/nav/PublicFooter";
import { getShowcaseCreators } from "@/features/public/server/queries";
import { getPublicTrail } from "@/features/public/server/trail-queries";
import { ClientMessages } from "@/i18n/ClientMessages";
import "@/features/public/components/launch/launch.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta");
  return { title: t("title"), description: t("description") };
}

// Reads the demo workspace at request time (cached a minute) so a missing
// database degrades to the static drawing instead of failing the build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trail, creators] = await Promise.all([getPublicTrail(), getShowcaseCreators()]);
  const names = creators.map((c) => c.name.split(" ")[0]).slice(0, 3);
  return (
    <ClientMessages namespaces={["landing"]}>
      <LaunchMotion />
      <main className="flex-1">
        <LaunchHero trail={trail} />
        <LaunchScenes trail={trail} creators={names} />
        <LaunchClosing trail={trail} />
      </main>
      <PublicFooter />
      <PublicAssistantPill />
    </ClientMessages>
  );
}
