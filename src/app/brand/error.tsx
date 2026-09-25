"use client";

import { RouteError } from "@/components/page/RouteError";

// Any brand page that throws while rendering lands here, inside the shell.
export default function BrandError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} homeHref="/brand" scope="brand" />;
}
