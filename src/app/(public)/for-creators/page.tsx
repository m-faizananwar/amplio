import type { Metadata } from "next";
import { ForCreatorsPage } from "@/features/public/components/pages/creators/ForCreatorsPage";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `Get paid to post on LinkedIn · ${BRAND.wordmark}`, description: "Choose deals from B2B brands you know, post in your own voice, and set your own price per post." };

export default function Page() {
  return <ForCreatorsPage />;
}
