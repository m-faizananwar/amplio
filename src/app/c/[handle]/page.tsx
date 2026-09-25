import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { buttonVariants } from "@/components/ui/button";
import { CreatorCardView } from "@/features/workspace/components/card/CreatorCardView";
import { getPublicCard } from "@/features/workspace/server/card-queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const [card, t] = await Promise.all([getPublicCard(handle), getTranslations("creator.publicCard")]);
  if (!card) return { title: t("notFound.title") };
  return { title: t("metaTitle", { name: card.name }), description: t("metaDescription", { name: card.name }) };
}

// The shareable deal link: a creator's card, public, with the one action a
// brand came for. Seeded creators say so.
export default async function PublicCardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [card, t] = await Promise.all([getPublicCard(handle), getTranslations("creator.publicCard")]);
  if (!card) notFound();
  const first = card.name.split(" ")[0] ?? card.name;
  const book = `/register/brand?ref=${card.handle}`;
  return (
    <main className="mx-auto grid w-full max-w-2xl gap-5 px-4 py-8 animate-rise sm:py-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" aria-label="Amplio"><BrandLockup size="sm" /></Link>
        <Link href={book} className={buttonVariants({ size: "sm" })}>{t("book", { name: first })}</Link>
      </div>
      {card.seeded ? <p role="note" className="rounded-control border border-rule bg-tint px-3 py-2 text-small text-ink-muted">{t("demoLabel")}</p> : null}
      <CreatorCardView card={card} />
      <div className="grid gap-3 rounded-card border border-rule bg-surface p-5">
        <Link href={book} className={buttonVariants({ size: "lg", className: "justify-self-start" })}>{t("book", { name: first })}</Link>
        <p className="text-small text-ink-muted">{t("bookHint", { name: first })}</p>
      </div>
      {card.seeded ? null : <p className="text-caption text-ink-muted">{t(`source.${card.source}`)}</p>}
    </main>
  );
}
