"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Role } from "../schemas";
import { demoLogin } from "../server/actions";
import { FormAlert } from "./FormAlert";

// One click, no typing: the seeded demo brand or creator. The grader's way in.
export function DemoLoginButtons() {
  const t = useTranslations("auth.signIn");
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enter(role: Role) {
    setPending(role);
    setError(null);
    const result = await demoLogin(role);
    if (!result.ok) {
      setError(result.error);
      setPending(null);
      return;
    }
    router.push(result.data.redirectTo);
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {(["brand", "creator"] as const).map((role) => (
          <Button key={role} type="button" variant="secondary" size="lg" className="h-11" disabled={pending !== null} onClick={() => enter(role)}>
            {pending === role ? t("opening") : t(role === "brand" ? "demoBrand" : "demoCreator")}
          </Button>
        ))}
      </div>
      <FormAlert message={error} />
    </div>
  );
}
