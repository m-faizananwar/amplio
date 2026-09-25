import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { RegisterView } from "@/features/auth/components/RegisterView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.meta"))("signUpCreator") };
}

export default function RegisterCreatorPage() {
  return (
    <AuthColumn>
      <RegisterView initialRole="creator" />
    </AuthColumn>
  );
}
