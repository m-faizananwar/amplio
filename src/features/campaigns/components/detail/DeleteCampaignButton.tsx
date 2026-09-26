"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteCampaign } from "../../server/actions";

// Two clicks: the first says what happens (held fees come back, nothing live
// can be deleted), the second does it.
export function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const t = useTranslations("brand.campaigns.detail.delete");
  const router = useRouter();
  async function confirm() {
    const result = await deleteCampaign(campaignId);
    if (!result.ok) return void toast.error(result.error);
    toast.success(t("done"));
    router.push("/brand/campaigns");
  }
  return <ConfirmButton variant="quiet" size="sm" confirmLabel={t("confirm")} onConfirm={confirm}><Trash2 aria-hidden="true" />{t("label")}</ConfirmButton>;
}
