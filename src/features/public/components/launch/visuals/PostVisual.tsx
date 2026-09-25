import { BrandMark } from "@/components/brand/BrandMark";
import { AudienceVisual } from "./AudienceVisual";

// Scene 1: a post goes out, carrying its own tracked link — and its audience
// lights up around it in rings. Our own drawing of a post, not a screenshot.
export function PostVisual({ creator, linkLabel }: { creator: string; linkLabel: string }) {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-xl items-center justify-center">
      <div className="absolute inset-0"><AudienceVisual /></div>
      <div className="relative w-[72%] rounded-card border border-rule bg-surface p-5 shadow-float sm:p-6">
        <div className="cut flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink text-small font-semibold text-paper">{creator.slice(0, 1)}</span>
          <div>
            <p className="text-body font-semibold">{creator}</p>
            <p className="text-caption text-ink-muted">LinkedIn</p>
          </div>
        </div>
        <div className="mt-4 space-y-2" aria-hidden="true">
          {[92, 100, 70].map((w, i) => (
            <span key={w} className="cut block h-2.5 rounded-full bg-ink/10" style={{ width: `${w}%`, ["--d" as string]: `${60 + i * 40}ms` }} />
          ))}
        </div>
        <div className="cut mt-5 flex items-center gap-2 rounded-control border border-ink bg-paper px-3 py-2" style={{ ["--d" as string]: "220ms" }}>
          <BrandMark size={18} />
          <span className="num truncate text-small">{linkLabel}</span>
          <span className="relative ml-auto flex size-2.5 shrink-0">
            <span className="ping absolute inset-0 rounded-full bg-money" />
            <span className="relative size-2.5 rounded-full bg-money" />
          </span>
        </div>
      </div>
    </div>
  );
}
