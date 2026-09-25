"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import type { ActionResult } from "../../schemas";

type StatusResult = ActionResult<{ collaborationId: string; status: CollaborationStatus }>;

// Runs a status-changing server action with an optimistic status: the badge
// flips at once, React rolls it back on its own if the action fails, and the
// revalidated page replaces it when it succeeds.
export function useCollaborationAction(setOptimisticStatus: (status: CollaborationStatus) => void) {
  const router = useRouter();
  const t = useTranslations("collaboration.detail.brand.toasts");
  const [isPending, startTransition] = useTransition();

  function run(optimistic: CollaborationStatus, action: () => Promise<StatusResult>, success: string) {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        setOptimisticStatus(optimistic);
        const result = await action();
        if (!result.ok) {
          toast.error(result.error, {
            action:
              result.code === "insufficient_funds"
                ? { label: t("topUp"), onClick: () => router.push("/brand/billing") }
                : undefined,
          });
          resolve(false);
          return;
        }
        toast.success(success);
        resolve(true);
      });
    });
  }

  return { run, isPending };
}
