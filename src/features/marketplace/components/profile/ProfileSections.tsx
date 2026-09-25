"use client";

import { ExternalLink } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { countryFlag, countryName } from "@/lib/country-flag";
import type { CreatorDto } from "../../schemas";
import { ReachChart } from "./ReachChart";

const PERCENT = 100;
const POSTS_SHOWN = 3;

// Audience mix: who engaged with their recent posts, largest group first.
export function AudienceMix({ creator }: { creator: CreatorDto }) {
  const t = useTranslations("brand.creators.profile.audience");
  const tf = useTranslations("brand.creators.fit.buckets");
  const label = (key: string) => (tf.has(key) ? tf(key) : key);
  const group = (title: string, mix: Record<string, number>) => {
    const rows = Object.entries(mix).sort((a, b) => b[1] - a[1]);
    return (
      <div>
        <p className="mb-2 text-caption text-ink-muted">{title}</p>
        {rows.length === 0 ? <p className="text-small text-ink-muted">{t("none")}</p> : (
          <ul className="grid gap-1.5">
            {rows.map(([key, pct], i) => (
              <li key={key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-small">
                <span className="truncate">{label(key)}</span>
                <span className="h-1.5 overflow-hidden rounded-chip bg-tint" aria-hidden="true"><span className="block h-full rounded-chip bg-ink animate-rise" style={{ width: `${Math.min(PERCENT, pct)}%`, animationDelay: `${i * 30}ms` }} /></span>
                <span className="num text-right text-ink-muted">{Math.round(pct)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  return (
    <section className="grid gap-3">
      <div>
        <h3 className="text-lead">{t("title")}</h3>
        <p className="text-caption text-ink-muted">{t("sample", { count: creator.engagerSample })}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{group(t("jobTitle"), creator.audienceJobTitles)}{group(t("seniority"), creator.audienceSeniority)}</div>
    </section>
  );
}

// Recent public posts: reach over time, then the latest few with their numbers.
export function RecentPosts({ creator }: { creator: CreatorDto }) {
  const t = useTranslations("brand.creators.profile.posts");
  const format = useFormatter();
  return (
    <section className="grid gap-3">
      <div>
        <h3 className="text-lead">{t("title")}</h3>
        <p className="text-caption text-ink-muted">{t("description")}</p>
      </div>
      <ReachChart posts={creator.posts} />
      <ul className="grid gap-3">
        {creator.posts.slice(0, POSTS_SHOWN).map((post) => (
          <li key={post.id} className="rounded-control border border-rule p-3 text-small">
            <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-ink-muted">
              <span className="num">{format.dateTime(new Date(post.postedAt), { day: "numeric", month: "short", year: "numeric" })}</span>
              <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-info hover:underline">{t("open")}<ExternalLink className="size-3" aria-hidden="true" /></a>
            </div>
            <p className="mt-2 line-clamp-3 whitespace-pre-line text-ink">{post.body}</p>
            <p className="num mt-2 text-caption text-ink-muted">{t("numbers", { views: format.number(post.impressions, { notation: "compact" }), reactions: post.reactions, comments: post.comments })}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Who they are, from their profile: bio, country, networks, when they joined.
export function Background({ creator }: { creator: CreatorDto }) {
  const t = useTranslations("brand.creators.profile.background");
  const format = useFormatter();
  const x = creator.xHandle?.replace(/^@/, "");
  return (
    <section className="grid gap-3">
      <h3 className="text-lead">{t("title")}</h3>
      {creator.bio ? <p className="text-body text-ink">{creator.bio}</p> : null}
      <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-small">
        <dt className="text-ink-muted">{t("country")}</dt><dd>{countryFlag(creator.country)} {countryName(creator.country)}</dd>
        <dt className="text-ink-muted">{t("networks")}</dt>
        <dd className="flex flex-wrap gap-3">
          {creator.linkedinUrl ? <a href={creator.linkedinUrl} target="_blank" rel="noreferrer" className="text-info hover:underline">LinkedIn</a> : null}
          {x ? <a href={`https://x.com/${x}`} target="_blank" rel="noreferrer" className="text-info hover:underline">X · @{x}</a> : null}
        </dd>
        <dt className="text-ink-muted">{t("since")}</dt><dd className="num">{format.dateTime(new Date(creator.memberSince), { month: "long", year: "numeric" })}</dd>
      </dl>
    </section>
  );
}
