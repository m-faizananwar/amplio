"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { demoLogin } from "@/features/auth/server/actions";
import type { Role } from "../nav";

// Only the demo accounts have both sides of the marketplace to look at, so
// only they see the switch: it signs into the other demo workspace, the same
// action as the buttons on /login. Real accounts have one role and no switch.
export function RoleSwitch({ role }: { role: Role }) {
  const t = useTranslations("shell.topBar.roleSwitch");
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <SegmentedControl
      size="sm"
      label={t("label")}
      value={role}
      className={pending ? "opacity-70" : undefined}
      onValueChange={(next) => {
        if (next === role) return;
        start(async () => {
          const result = await demoLogin(next);
          if (result.ok) router.push(result.data.redirectTo);
        });
      }}
      options={[{ value: "brand", label: t("brand") }, { value: "creator", label: t("creator") }]}
    />
  );
}
