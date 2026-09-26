import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LocaleToggle } from "@/components/shell/topbar/LocaleToggle";
import s from "./wizard.module.css";

type Props = { rail?: ReactNode; eyebrow: string; title: string; sub: string; children: ReactNode };

// Every onboarding screen: the lockup home and the language, the step rail,
// then the wizard card — the step's eyebrow, title and one line above its
// fields on the left, the preview on the right (above the fields on phones).
// Children place themselves with data-area="fields" | "card".
export function WizardShell({ rail, eyebrow, title, sub, children }: Props) {
  return (
    <div className={s.shell}>
      <header className={s.top}>
        <Link href="/" aria-label="Amplio home" className="rounded-control focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ink/20">
          <BrandLockup size="md" />
        </Link>
        <LocaleToggle />
      </header>
      <main className={`${s.main} animate-rise`}>
        {rail ? <div className={s.rail}>{rail}</div> : null}
        <div className={s.grid}>
          <div className={s.head}>
            <p className={s.eyebrow}>{eyebrow}</p>
            <h1 className={s.title}>{title}</h1>
            <p className={s.sub}>{sub}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
