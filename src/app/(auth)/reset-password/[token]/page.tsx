import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { AuthColumn } from "@/features/auth/components/AuthColumn";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { getResetTokenState } from "@/features/auth/server/reset-queries";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.meta"))("reset") };
}

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [state, t] = await Promise.all([getResetTokenState(token), getTranslations("auth.reset")]);
  if (state === "valid") {
    return (
      <AuthColumn>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("sub")}</p>
        <div className="mt-8"><ResetPasswordForm token={token} /></div>
      </AuthColumn>
    );
  }
  return (
    <AuthColumn>
      <h1 className="text-h2">{t("invalidTitle")}</h1>
      <p className="mt-2 text-ink-muted">{t(`reasons.${state}`)}</p>
      <div className="mt-8 grid gap-3">
        <Link href="/forgot-password" className={cn(buttonVariants({ size: "lg" }), "h-11")}>{t("requestNew")}</Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11")}>{t("back")}</Link>
      </div>
    </AuthColumn>
  );
}
