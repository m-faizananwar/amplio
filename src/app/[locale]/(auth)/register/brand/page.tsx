import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { RegisterView } from "@/features/auth/components/RegisterView";
import { enterLocale, type LocaleParams } from "@/i18n/segment";

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  const locale = await enterLocale(props);
  return { title: (await getTranslations({ locale, namespace: "auth.meta" }))("signUpBrand") };
}

export default async function RegisterBrandPage(props: LocaleParams) {
  await enterLocale(props);
  return (
    <AuthColumn>
      <RegisterView initialRole="brand" />
    </AuthColumn>
  );
}
