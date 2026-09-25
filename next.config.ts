import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Barrel imports are convenient to write and expensive to ship: one
  // `import { X } from "pkg"` can pull the package's whole index into the
  // route's chunk. Next rewrites these to the deep import that actually
  // defines X. lucide-react is on next's default list; these are the ones our
  // client components reach for.
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts", "date-fns", "@base-ui/react", "zod", "cmdk", "sonner"],
  },
};

export default nextConfig;
