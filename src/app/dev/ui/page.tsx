import type { Metadata } from "next";
import { UiGallery } from "@/components/dev-gallery/UiGallery";

// Hidden: not linked anywhere, not indexed. Every primitive in every state,
// so the three builders can check a component before using it.
export const metadata: Metadata = { title: "UI · dev", robots: { index: false, follow: false } };

export default function DevUiPage() {
  return <UiGallery />;
}
