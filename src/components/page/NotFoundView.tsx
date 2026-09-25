"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { pickLocale } from "@/i18n/negotiate";
import { cn } from "@/lib/cn";

export type NotFoundCopy = { eyebrow: string; title: string; body: string; home: string; signIn: string };

const noSubscribe = () => () => undefined;
function readLocale(): Locale {
  const cookie = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([a-z]+)`))?.[1];
  return pickLocale(cookie, navigator.languages.join(","));
}

// The 404 sits above every page, so it can't read the request without making
// the static public pages dynamic. It ships both languages' lines (a few
// words) and picks one in the browser: the cookie, then the browser language.
export function NotFoundView({ copy }: { copy: Record<Locale, NotFoundCopy> }) {
  const locale = useSyncExternalStore(noSubscribe, readLocale, () => DEFAULT_LOCALE);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const t = copy[locale];
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-28 text-center">
      <svg viewBox="0 0 120 80" className="nf-trail h-20 w-32" aria-hidden="true">
        <path className="nf-left" d="M14 60 L58 42" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path className="nf-right" d="M64 40 L106 16" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle className="nf-dot nf-dot-1" cx="14" cy="60" r="7" fill="var(--color-ink)" />
        <circle className="nf-dot nf-dot-2" cx="60" cy="41" r="7" fill="var(--color-ink)" />
        <circle className="nf-dot nf-dot-3" cx="106" cy="16" r="7" fill="var(--color-ink)" />
      </svg>
      <p className="num mt-8 text-small text-ink-muted">{t.eyebrow}</p>
      <h1 className="mt-2 max-w-xl text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-[-0.035em]">{t.title}</h1>
      <p className="mt-4 max-w-md text-lead text-ink-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>{t.home}</Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11 px-5")}>{t.signIn}</Link>
      </div>
    </main>
  );
}
