import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { RegisterView } from "@/features/auth/components/RegisterView";
import { REGISTER_ROLE_PARAM } from "@/features/auth/constants";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.meta"))("signUp") };
}

// /register?role=… (older links) lands on that role's sign-up; bare
// /register starts as a brand, one tap away from creator.
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const target = role ? REGISTER_ROLE_PARAM[role] : undefined;
  if (target) redirect(target);
  return (
    <AuthColumn>
      <RegisterView initialRole="brand" />
    </AuthColumn>
  );
}
