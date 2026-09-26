"use client";

import { BarChart3, FileText, FolderOpen, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// The row's "…": the campaign's own places, one click from the list. It sits
// beside the row's link (a button can't live inside a link).
export function CampaignRowMenu({ id, name }: { id: string; name: string }) {
  const t = useTranslations("brand.campaigns.list.rowMenu");
  const base = `/brand/campaigns/${id}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("more", { name })} />}>
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href={base} />}><FolderOpen aria-hidden="true" />{t("open")}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`${base}/brief/edit`} />}><FileText aria-hidden="true" />{t("editBrief")}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`${base}/analytics`} />}><BarChart3 aria-hidden="true" />{t("analytics")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
