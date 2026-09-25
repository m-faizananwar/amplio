"use client";

import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LinkedInMark } from "../LinkedInMark";

export type OpportunitySort = "relevance" | "deadline" | "brand";
export type OpportunityFilterState = { channel: "all" | "linkedin"; query: string; industry: string; region: string; sort: OpportunitySort };

type Props = {
  value: OpportunityFilterState;
  onChange: (next: OpportunityFilterState) => void;
  counts: { all: number; linkedin: number };
  industries: string[];
  regions: string[];
};

const SELECT_CLASS =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function ChannelTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
        active ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function OpportunityFilters({ value, onChange, counts, industries, regions }: Props) {
  const set = (patch: Partial<OpportunityFilterState>) => onChange({ ...value, ...patch });
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <ChannelTab active={value.channel === "all"} onClick={() => set({ channel: "all" })}>
          All channels
          <span className="rounded-full bg-background/20 px-1.5 text-xs">{counts.all}</span>
        </ChannelTab>
        <ChannelTab active={value.channel === "linkedin"} onClick={() => set({ channel: "linkedin" })}>
          <LinkedInMark className="size-3.5" />
          LinkedIn
          <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{counts.linkedin}</span>
        </ChannelTab>
      </div>
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search for a campaign or a brand"
            placeholder="Search for a campaign or a brand…"
            value={value.query}
            onChange={(e) => set({ query: e.target.value })}
            className="h-9 pl-9"
          />
        </div>
        <select aria-label="Industry" className={SELECT_CLASS} value={value.industry} onChange={(e) => set({ industry: e.target.value })}>
          <option value="">All industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select aria-label="Country" className={SELECT_CLASS} value={value.region} onChange={(e) => set({ region: e.target.value })}>
          <option value="">All countries</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select aria-label="Sort" className={SELECT_CLASS} value={value.sort} onChange={(e) => set({ sort: e.target.value as OpportunitySort })}>
          <option value="relevance">Relevance (default)</option>
          <option value="deadline">Post deadline</option>
          <option value="brand">Brand A–Z</option>
        </select>
      </div>
    </div>
  );
}
