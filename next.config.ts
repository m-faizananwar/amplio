import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Barrel imports are convenient to write and expensive to ship: one
  // `import { X } from "pkg"` can pull the package's whole index into the
  // route's chunk. Next rewrites these to the deep import that actually
  // defines X. lucide-react is on next's default list; these are the ones our
  // client components reach for.
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts", "date-fns", "@base-ui/react", "zod", "cmdk", "sonner"],
    // Every app page is dynamic (it reads the session), and next's default is
    // to throw a dynamic page's payload away the moment you leave it, so going
    // back to a page you saw five seconds ago cost a full round trip — ~340 ms
    // of it pure network from Asia to iad1. 30 s of reuse makes sidebar
    // back-and-forth free. Freshness: a server action that revalidates purges
    // this cache, and RouteTransition refreshes when the window regains focus,
    // which is when another session's changes (the creator's accept, in the
    // two-window demo) would otherwise hide behind it.
    staleTimes: { dynamic: 30 },
    // Full prefetch on hover instead of the loading-boundary-only default: the
    // hover-to-click gap pays for most of the round trip before the click.
    dynamicOnHover: true,
  },
};

export default nextConfig;
