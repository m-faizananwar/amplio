"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inviteCreator } from "../../server/actions";

type Props = { campaignId: string; creatorId: string; creatorName: string; disabled?: boolean };

// A funded invitation at the creator's listed price, from the shortlist.
export function InviteButton({ campaignId, creatorId, creatorName, disabled }: Props) {
  const t = useTranslations("brand.campaigns.creatorRow");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function invite() {
    startTransition(async () => {
      const result = await inviteCreator({ campaignId, creatorId });
      if (!result.ok) return void toast.error(result.error);
      toast.success(t("invited", { name: creatorName }));
      router.refresh();
    });
  }
  return <Button type="button" size="sm" onClick={invite} disabled={disabled || pending}>{disabled ? t("alreadyInvited") : pending ? t("inviting") : t("invite")}</Button>;
}
