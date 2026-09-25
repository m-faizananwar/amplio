"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/skeleton/Skeletons";
import type { CreatorPostDto } from "../../schemas";

// The profile modal opens on a click, and its Content tab is one tab in: no
// reason for recharts to ride along with the creators grid.
const ReachChartCanvas = dynamic(() => import("./ReachChartCanvas").then((m) => m.ReachChartCanvas), {
  ssr: false,
  loading: () => <div className="h-45 w-full"><ChartSkeleton /></div>,
});

export function ReachChart({ posts }: { posts: CreatorPostDto[] }) {
  return <ReachChartCanvas posts={posts} />;
}
