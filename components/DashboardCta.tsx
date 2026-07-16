"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@practics/ui";

// Intent-based prefetching without shipping react-query to the landing
// page: on hover/focus/touch we fetch /api/transactions and let the
// browser's HTTP cache hold it (the API sends Cache-Control: max-age=300).
// When the dashboard's query fires after navigation, its fetch is served
// from cache. Next.js prefetches the route chunk itself automatically.
export function DashboardCta({ children, ...buttonProps }: ButtonProps) {
  const warm = () => {
    void fetch("/api/transactions").catch(() => {});
  };

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
