import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand/BrandLockup";

// The public footer: lockup + tagline, three short columns, the demo-data
// note. Calm: paper, a hairline above, no effects.
export async function PublicFooter() {
  const t = await getTranslations("landing.footer");
  const l = (key: string) => t(`links.${key}`);
  const cols = [
    { title: t("product"), links: [["/for-creators", l("forCreators")], ["/pricing", l("pricing")], ["/faq", l("faq")]] },
    { title: t("company"), links: [["/login", l("signIn")], ["/register", l("signUp")]] },
    { title: t("legal"), links: [["/privacy", l("privacy")], ["/terms", l("terms")]] },
  ];
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <BrandLockup size="md" />
          <p className="mt-3 max-w-xs text-ink-muted">{t("tagline")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-small font-medium">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-ink-muted hover:text-ink">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-content border-t border-rule px-4 py-6 text-caption text-ink-muted sm:px-8">© 2026 Amplio · {t("demoNote")}</p>
    </footer>
  );
}
