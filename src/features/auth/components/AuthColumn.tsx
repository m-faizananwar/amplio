import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LocaleToggle } from "@/components/shell/topbar/LocaleToggle";

// Auth is one centred column (DIRECTION.md): the lockup home, the rail when
// there is one, the form, and quiet legal links. No second pane, no media.
export async function AuthColumn({ rail, children }: { rail?: ReactNode; children: ReactNode }) {
  const t = await getTranslations("landing.footer.links");
  return (
    <div className="flex min-h-[100svh] flex-col bg-paper">
      <header className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" aria-label="Amplio home" className="rounded-control focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink/20">
          <BrandLockup size="md" />
        </Link>
        <LocaleToggle />
      </header>
      <main className="flex flex-1 justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-[26rem] animate-rise">
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
