"use client";

import RouteErrorState from "@/components/ui/RouteErrorState";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorState title="Unable to load this assignment" reset={reset} />;
}
