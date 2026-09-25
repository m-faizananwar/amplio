import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { DemoLoginButtons } from "@/features/auth/components/DemoLoginButtons";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  return { title: (await getTranslations({ locale, namespace: "auth.meta" }))("signIn") };
}

// The demo accounts first (the fastest way in), then email and password.
export default async function LoginPage(props: LocaleParams) {
  await enterLocale(props);
  const t = await getTranslations("auth.signIn");
  return (
    <AuthColumn>
      <h1 className="text-h2">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("sub")}</p>
      <section className="mt-8 rounded-card border border-rule bg-surface p-4" aria-labelledby="demo-title">
        <p id="demo-title" className="text-small font-medium">{t("demoTitle")}</p>
        <p className="mb-3 mt-1 text-small text-ink-muted">{t("demoBody")}</p>
        <DemoLoginButtons />
      </section>
      <div className="my-6 flex items-center gap-3 text-caption text-ink-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-rule" />{t("or")}<span className="h-px flex-1 bg-rule" />
      </div>
      <LoginForm />
    </AuthColumn>
  );
}
