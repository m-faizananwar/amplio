import { Menu } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LocaleToggle } from "@/components/shell/topbar/LocaleToggle";
import { ThemeToggle } from "@/components/shell/topbar/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// The public site's nav: the lockup, three links, the language and theme switches, sign
// in / sign up. Solid paper and a hairline — no glass. Phones get the lockup,
// Sign up and a menu.
export async function PublicNav() {
  const t = await getTranslations("landing.footer.links");
  const links = [
    { href: "/for-creators", label: t("forCreators") },
    { href: "/pricing", label: t("pricing") },
    { href: "/faq", label: t("faq") },
  ];
  const linkClass = "rounded-control px-3 py-2 text-body text-ink-muted transition-colors duration-(--duration-fast) hover:bg-tint hover:text-ink";
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <div className="mx-auto flex h-16 max-w-content items-center gap-4 px-4 sm:px-8">
        <Link href="/" aria-label="Amplio home" className="rounded-control focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink/20">
          <BrandLockup size="md" />
        </Link>
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className={linkClass}>{l.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block"><LocaleToggle /></div>
          <div className="hidden lg:block"><ThemeToggle /></div>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>{t("signIn")}</Link>
          <Link href="/register" className={buttonVariants()}>{t("signUp")}</Link>
          <details className="relative md:hidden">
            <summary aria-label="Menu" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "list-none [&::-webkit-details-marker]:hidden")}>
              <Menu aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-card border border-rule bg-surface p-2 shadow-float">
              {[...links, { href: "/login", label: t("signIn") }].map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-control px-3 py-2.5 text-body hover:bg-tint">{l.label}</Link>
              ))}
              <div className="flex flex-wrap gap-2 border-t border-rule px-1 pt-2"><LocaleToggle /><ThemeToggle /></div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
