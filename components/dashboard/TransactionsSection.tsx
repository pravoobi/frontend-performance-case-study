"use client";

// Client island for the interactive part of the dashboard: fetches the row
// data, owns filter state, renders the table and the detail drawer.
// (Still naive on purpose: full 10k fetch, every row mounted, aggressive
// re-renders — addressed in later passes.)
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

export function TransactionsSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data: Transaction[]) => {
        setTransactions(data);
        setLoading(false);
      });
  }, []);

  const filtered = transactions.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (status !== "all" && t.status !== status) return false;
    if (
      search &&
      !t.merchant.toLowerCase().includes(search.toLowerCase()) &&
      !t.category.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

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
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </div>
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
