"use client";

// Client island for the interactive part of the dashboard: fetches the row
// data, owns filter state, renders the table and the detail drawer.
import { useDeferredValue, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { transactionsQuery } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from "@practics/ui";
import { Search } from "lucide-react";
import type { Transaction } from "@/lib/transactions";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

// Pass 3: the drawer (Radix Dialog + detail view) is loaded on demand — its
// chunk is only fetched the first time a row is opened.
const TransactionDrawer = dynamic(
  () =>
    import("@/components/dashboard/TransactionDrawer").then(
      (m) => m.TransactionDrawer,
    ),
  { ssr: false },
);

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  ...[
    "Groceries",
    "Dining",
    "Transport",
    "Shopping",
    "Utilities",
    "Entertainment",
    "Health",
    "Travel",
    "Income",
  ].map((c) => ({ value: c, label: c })),
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

// Pass 8: skeleton rows in the table's real layout instead of a spinner —
// the page keeps its final shape while data streams in (better perceived
// performance, no layout jump when rows arrive).
function TableSkeleton() {
  return (
    <div aria-busy="true" className="px-4 py-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-border py-4">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          <div className="hidden h-3 w-36 animate-pulse rounded bg-muted sm:block" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TransactionsSection() {
  // Pass 8: TanStack Query owns the fetch — request deduplication, a
  // session-long cache (no refetch of 10k rows when navigating back),
  // and a cache entry the landing page can pre-warm on hover.
  const { data: transactions = [], isPending: loading } =
    useQuery(transactionsQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  // Pass 7 (profiler-guided): typing in the search box re-ran this filter
  // over 10k rows and re-rendered the table on every keystroke.
  // - useDeferredValue keeps the input responsive: the keystroke renders
  //   immediately, the expensive filter render is deferred and interruptible.
  // - useMemo skips the 10k-row scan entirely when an unrelated state
  //   change (opening the drawer) re-renders this component.
  const deferredSearch = useDeferredValue(search);
  const filtered = useMemo(() => {
    const needle = deferredSearch.toLowerCase();
    return transactions.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (status !== "all" && t.status !== status) return false;
      if (
        needle &&
        !t.merchant.toLowerCase().includes(needle) &&
        !t.category.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [transactions, category, status, deferredSearch]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Transactions{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({loading ? "…" : filtered.length.toLocaleString()})
              </span>
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Search merchant or category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconLeft={<Search className="h-4 w-4" />}
                className="sm:w-64"
              />
              <Select
                options={CATEGORY_OPTIONS}
                value={category}
                onValueChange={setCategory}
                className="sm:w-44"
              />
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={setStatus}
                className="sm:w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : (
            <TransactionsTable transactions={filtered} onSelect={setSelected} />
          )}
        </CardContent>
      </Card>

      {selected && (
        <TransactionDrawer
          transaction={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
