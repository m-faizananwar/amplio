import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DemoLandingActions } from "@/features/tracking/components/demo/DemoLandingActions";
import { getDemoSite } from "@/features/tracking/server/demo-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: "Demo landing page · pixel test" };

// A stand-in for a customer's website with our pixel installed. English only:
// it plays the customer's site, not our product. Arrive
// through a tracked link (/r/{code}) and the visit + any sign-up is attributed.
export default async function DemoLandingPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const { site } = await searchParams;
  const demo = await getDemoSite(site);
  if (!demo) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <EmptyState
          title="Demo site unavailable"
          body="This page needs the database (or a valid site key) to load a brand's pixel."
          action={<Link href="/" className={buttonVariants({ variant: "secondary" })}>{`Back to ${BRAND.wordmark}`}</Link>}
        />
      </main>
    );
  }
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
      <Script id={`${BRAND.key}-queue`} strategy="beforeInteractive">
        {`window.${BRAND.pixelGlobal} = window.${BRAND.pixelGlobal} || function(){ (window.${BRAND.pixelGlobal}.q = window.${BRAND.pixelGlobal}.q || []).push(arguments); };`}
      </Script>
      <Script src="/n.js" data-site={demo.siteKey} strategy="afterInteractive" />
      <div>
        <p className="text-caption font-medium uppercase tracking-wider text-ink-muted">Demo landing page · {demo.company}</p>
        <h1 className="mt-3 text-h2 font-semibold tracking-(--tracking-heading)">This is {demo.company}&apos;s website, with the {BRAND.wordmark} pixel installed.</h1>
        <p className="mt-4 text-lead text-ink-muted">
          {demo.valueProp ?? "A product page like any other."} Land here from a creator&apos;s tracked link and every action below is
          attributed to that creator.
        </p>
        <p className="mt-4 text-caption text-ink-muted">
          Site key <code className="num rounded-chip bg-tint px-1">{demo.siteKey}</code> · script <code className="num rounded-chip bg-tint px-1">/n.js</code>
        </p>
      </div>
      <DemoLandingActions />
    </main>
  );
}
