"use client";

import { RouteError } from "@/components/page/RouteError";

export default function CreatorsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} homeHref="/brand" scope="brand/creators" />;
}
