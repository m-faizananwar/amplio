import { useTranslations } from "next-intl";
import type { Brief } from "../../schemas";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-rule pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-caption text-ink-muted">{title}</h3>
      <div className="grid gap-4 text-body">{children}</div>
    </section>
  );
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-ink-muted">{empty}</p>;
  return <ul className="flex flex-wrap gap-1.5">{items.map((item) => <li key={item} className="rounded-chip border border-rule px-2.5 py-0.5 text-caption">{item}</li>)}</ul>;
}

function Lines({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-ink-muted">{empty}</p>;
  return <ul className="list-disc space-y-1 pl-5 marker:text-ink-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

// The brief as a creator reads it: what to say and why, who it's for, the
// rules, then the angles with a hook and an example each.
export function BriefReadView({ brief }: { brief: Brief }) {
  const t = useTranslations("brand.campaigns.brief");
  return (
    <div className="grid gap-5 rounded-card border border-rule bg-surface p-5">
      <Section title={t("sections.context")}>
        <p className="whitespace-pre-line leading-relaxed">{brief.whatToTell || t("empty.whatToTell")}</p>
        {brief.links.length > 0 ? (
          <div>
            <p className="font-medium">{t("fields.links")}</p>
            <ul className="mt-1 space-y-1">{brief.links.map((link) => <li key={link}><a href={link} target="_blank" rel="noreferrer" className="break-all text-info hover:underline">{link}</a></li>)}</ul>
          </div>
        ) : null}
      </Section>
      <Section title={t("sections.audience")}>
        <div><p className="font-medium">{t("fields.industries")}</p><div className="mt-1.5"><Chips items={brief.targetIndustries} empty={t("empty.industries")} /></div></div>
        <div><p className="font-medium">{t("fields.geos")}</p><div className="mt-1.5"><Chips items={brief.targetGeos} empty={t("empty.geos")} /></div></div>
        <p><span className="font-medium">{t("fields.tone")} · </span>{brief.tone || t("empty.tone")}</p>
      </Section>
      <Section title={t("sections.rules")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="font-medium">{t("fields.do")}</p><div className="mt-1"><Lines items={brief.do} empty={t("empty.rules")} /></div></div>
          <div><p className="font-medium">{t("fields.avoid")}</p><div className="mt-1"><Lines items={brief.avoid} empty={t("empty.rules")} /></div></div>
        </div>
      </Section>
      <Section title={t("sections.angles")}>
        {brief.angles.length === 0 ? <p className="text-ink-muted">{t("empty.angles")}</p> : null}
        {brief.angles.map((angle, i) => (
          <article key={`${i}-${angle.angle}`} className="grid gap-2 rounded-control border border-rule p-4">
            <p className="num text-caption text-ink-muted">{String(i + 1).padStart(2, "0")}</p>
            <h4 className="font-medium">{angle.angle}</h4>
            {angle.hook ? <p className="italic">“{angle.hook}”</p> : null}
            {angle.direction ? <p className="text-ink-muted"><span className="font-medium text-ink">{t("fields.direction")} · </span>{angle.direction}</p> : null}
            {angle.example ? (
              <div className="rounded-control bg-paper p-3">
                <p className="text-caption text-ink-muted">{t("fields.example")}</p>
                <p className="mt-1 whitespace-pre-line">{angle.example}</p>
              </div>
            ) : null}
          </article>
        ))}
      </Section>
    </div>
  );
}
