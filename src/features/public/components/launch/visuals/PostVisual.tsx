import { BrandMark } from "@/components/brand/BrandMark";

// Scene 1: a post goes out, carrying its own tracked link. Our own drawing of
// a post (bars for text), not a screenshot of anyone's feed.
export function PostVisual({ creator, linkLabel }: { creator: string; linkLabel: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-card border border-rule bg-surface p-6 shadow-float">
      <div className="cut flex items-center gap-3" style={{ ["--d" as string]: "0ms" }}>
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-small font-semibold text-paper">{creator.slice(0, 1)}</span>
        <div>
          <p className="text-body font-semibold">{creator}</p>
          <p className="text-caption text-ink-muted">LinkedIn · now</p>
        </div>
      </div>
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[92, 100, 78, 64].map((w, i) => (
          <span key={w} className="cut block h-2.5 rounded-full bg-ink/10" style={{ width: `${w}%`, ["--d" as string]: `${80 + i * 50}ms` }} />
        ))}
      </div>
      <div className="cut mt-6 flex items-center gap-2 rounded-control border border-ink bg-paper px-3 py-2" style={{ ["--d" as string]: "320ms" }}>
        <BrandMark size={18} />
        <span className="num text-small">{linkLabel}</span>
        <span className="relative ml-auto flex size-2.5">
          <span className="ping absolute inset-0 rounded-full bg-money" />
          <span className="relative size-2.5 rounded-full bg-money" />
        </span>
      </div>
    </div>
  );
}
