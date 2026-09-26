import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { jakarta } from "./jakarta";
import { SetupGrow } from "./SetupGrow";
import s from "./setup.module.css";

export type SetupTab = { key: string; title: string; href: string | null; done: boolean };

type Props = {
  name: string;
  stepOf: string;
  title: string;
  sub: string;
  railLabel: string;
  doneLabel: string;
  tabs: SetupTab[];
  current: string;
  foot?: ReactNode;
  // the step's form: its fields (data-area="fields") and the preview (data-area="card")
  children: ReactNode;
};

function Num({ n, done }: { n: number; done: boolean }) {
  return <span className={s.num} data-done={done ? "" : undefined} aria-hidden="true">{done ? <Check /> : n}</span>;
}

// Setup inside the app shell: the setup's name and progress, the steps as
// tabs on an ink rail with the current one open as the step's card, the live
// preview beside it. Finished steps stay reachable; phones get a step strip.
export function SetupShell(props: Props) {
  const { name, stepOf, title, sub, railLabel, doneLabel, tabs, current, foot, children } = props;
  const at = tabs.findIndex((t) => t.key === current);
  const tab = (t: SetupTab, i: number) => {
    const inner = <><Num n={i + 1} done={t.done} />{t.title}{t.done ? <small>{doneLabel}</small> : null}</>;
    return <li key={t.key}>{t.href ? <Link href={t.href} className={s.tab}>{inner}</Link> : <span className={s.tab}>{inner}</span>}</li>;
  };
  return (
    <div className={`${s.setup} ${jakarta.variable}`}>
      <header className={s.head}>
        <p className={s.eyebrow}>{name} · <b>{stepOf}</b></p>
        <h1 className={s.title}>{title}</h1>
        <p className={s.sub}>{sub}</p>
      </header>
      <nav className={s.strip} aria-label={railLabel}>
        {tabs.map((t, i) => (
          t.href ? <Link key={t.key} href={t.href} className={s.chip} aria-current={t.key === current ? "step" : undefined}><Num n={i + 1} done={t.done && t.key !== current} />{t.title}</Link> : null
        ))}
      </nav>
      <div className={s.rail} aria-hidden="true" />
      <ol className={s.before} aria-label={railLabel}>{tabs.slice(0, at).map((t, i) => tab(t, i))}</ol>
      <div className={s.current} data-setup-current aria-current="step"><Num n={at + 1} done={false} />{tabs[at]?.title}</div>
      {children}
      <ol className={s.after} start={at + 2} aria-label={railLabel}>{tabs.slice(at + 1).map((t, i) => tab(t, at + 1 + i))}</ol>
      {foot ? <div className={s.foot}>{foot}</div> : null}
      <SetupGrow stepKey={current} />
    </div>
  );
}
