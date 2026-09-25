"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepRail } from "@/components/flow/StepRail";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Role } from "../schemas";
import { RegisterForm } from "./RegisterForm";

// Sign-up: the role is a segmented control (not two pages to choose between),
// the rail shows the whole path ahead for that role with this step first.
export function RegisterView({ initialRole }: { initialRole: Role }) {
  const t = useTranslations("auth.signUp");
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const steps = t.raw(role === "brand" ? "stepsBrand" : "stepsCreator") as string[];
  const pick = (next: Role) => {
    setRole(next);
    router.replace(`/register/${next}`, { scroll: false });
  };
  return (
    <>
      <StepRail steps={steps} current={0} label={t("stepsLabel")} stepOf={t("stepOf", { current: 1, total: steps.length })} className="mb-10" />
      <h1 className="text-h2">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t(role === "brand" ? "subBrand" : "subCreator")}</p>
      <SegmentedControl
        className="mt-6 w-full"
        label={t("roleLabel")}
        value={role}
        onValueChange={pick}
        options={[
          { value: "brand", label: t("roleBrand") },
          { value: "creator", label: t("roleCreator") },
        ]}
      />
      <div className="mt-6"><RegisterForm key={role} role={role} /></div>
    </>
  );
}
