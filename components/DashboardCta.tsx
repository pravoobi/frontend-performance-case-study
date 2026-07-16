"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button, type ButtonProps } from "@practics/ui";
import { transactionsQuery } from "@/lib/queries";

// Pass 8: intent-based prefetching. Next.js already prefetches the
// /dashboard route chunk when the link nears the viewport; this also
// warms the transactions cache the moment the user signals intent
// (hover/focus/touch), so the dashboard table renders from cache instead
// of starting its fetch after navigation.
export function DashboardCta({
  children,
  ...buttonProps
}: ButtonProps) {
  const queryClient = useQueryClient();
  const warm = () => queryClient.prefetchQuery(transactionsQuery);

  return (
    <Link
      href="/dashboard"
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
    >
      <Button {...buttonProps}>{children}</Button>
    </Link>
  );
}
