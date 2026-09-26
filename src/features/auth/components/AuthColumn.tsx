import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LocaleToggle } from "@/components/shell/topbar/LocaleToggle";
import { AmbientTrail } from "@/features/public/components/stage/AmbientTrail";

// Auth and onboarding are one centred column (DIRECTION.md); `wide` gives
// onboarding's longer forms room: the lockup home, the rail when
// there is one, the form, and quiet legal links. No second pane, no media.
export async function AuthColumn({ rail, children, wide = false }: { rail?: ReactNode; children: ReactNode; wide?: boolean }) {
  const t = await getTranslations("landing.footer.links");
  return (
    <div className="font-app flex min-h-[100svh] flex-col bg-paper">
      <header className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" aria-label="Amplio home" className="rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-money">
          <BrandLockup size="md" />
        </Link>
        <LocaleToggle />
      </header>
      <main className="relative flex flex-1 justify-center px-4 pb-16 pt-6 sm:pt-12">
        <AmbientTrail className="pointer-events-none absolute left-[max(2rem,calc(50%-40rem))] top-24 hidden w-56 opacity-70 lg:block" />
        <div className={wide ? "w-full max-w-[36rem] animate-rise" : "w-full max-w-[26rem] animate-rise"}>
          {rail ? <div className="mb-10">{rail}</div> : null}
          {children}
        </div>
      </main>
      <footer className="flex justify-center gap-5 px-4 pb-8 text-caption text-ink-muted">
        <Link href="/privacy" className="hover:text-ink">{t("privacy")}</Link>
        <Link href="/terms" className="hover:text-ink">{t("terms")}</Link>
      </footer>
    </div>
  );
}
