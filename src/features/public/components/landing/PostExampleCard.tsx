import { ExternalLink, Eye } from "lucide-react";
import { POST_EXAMPLES, type PublicPost } from "../../constants";
import { GlassCard } from "../glass/GlassCard";
import { CreatorAvatar } from "../shared/CreatorAvatar";

const format = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function PostExampleCard({ post, index }: { post: PublicPost; index: number }) {
  // Only what the database holds: the creator's own impressions. The click and
  // lead figures here were estimates from someone else's benchmark rates.
  const stats = [{ icon: Eye, value: format.format(post.impressions), label: "Impressions" }];
  return (
    <GlassCard title={post.creatorName} index={index + 1} order={index} className="p-6">
      <div className="flex items-center gap-3">
        <CreatorAvatar name={post.creatorName} src={post.avatarUrl} className="size-10" />
        <p className="truncate text-xs text-muted-foreground">{post.creatorLine}</p>
      </div>
      <p className="line-clamp-3 flex-1 py-4 text-base font-semibold leading-snug">{post.title}</p>
      <div aria-hidden="true" className="h-28 rounded-lg bg-linear-to-br from-brand-sky/70 via-brand-soft to-muted" />
      <dl className="my-4 grid grid-cols-3 gap-1 rounded-xl bg-background/50 p-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <dd className="flex items-center justify-center gap-1 text-sm font-bold">
              <stat.icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {stat.value}
            </dd>
            <dt className="text-[0.65rem] text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between border-t border-foreground/10 pt-3 text-xs">
        <span className="text-muted-foreground">LinkedIn</span>
        <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
          View post
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </GlassCard>
  );
}
