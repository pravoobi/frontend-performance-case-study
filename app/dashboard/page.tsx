"use client";

// Baseline dashboard: fully client-rendered, fetches all 10,000 transactions
// on mount, recomputes every aggregate on every keystroke, renders every row.
import { useEffect, useState } from "react";
import Link from "next/link";
import groupBy from "lodash/groupBy";
import sumBy from "lodash/sumBy";
import orderBy from "lodash/orderBy";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  StatCard,
} from "@practics/ui";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  PiggyBank,
  Search,
  Wallet,
} from "lucide-react";
import type { Transaction } from "@/lib/transactions";
import { formatCurrency, formatMonth, monthKey } from "@/lib/format";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TransactionDrawer } from "@/components/dashboard/TransactionDrawer";

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

export default function DashboardPage() {
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

  // Baseline: all of this re-runs on every render — every keystroke in the
  // search box recomputes aggregates over 10,000 rows and re-renders the
  // entire table.
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

  const income = sumBy(
    transactions.filter((t) => t.amount > 0),
    "amount",
  );
  const spend = -sumBy(
    transactions.filter((t) => t.amount < 0),
    "amount",
  );
  const net = income - spend;
  const savingsRate = income > 0 ? ((income - spend) / income) * 100 : 0;

  const byMonth = groupBy(transactions, (t) => monthKey(t.date));
  const monthly = orderBy(Object.entries(byMonth), ([key]) => key).map(
    ([key, txns]) => ({
      month: formatMonth(txns[0].date),
      key,
      spend: Math.round(-sumBy(txns.filter((t) => t.amount < 0), "amount")),
      income: Math.round(sumBy(txns.filter((t) => t.amount > 0), "amount")),
    }),
  );

  const byCategory = groupBy(
    transactions.filter((t) => t.amount < 0),
    "category",
  );
  const categorySlices = orderBy(
    Object.entries(byCategory).map(([cat, txns]) => ({
      category: cat,
      total: Math.round(-sumBy(txns, "amount")),
    })),
    "total",
    "desc",
  );

  return (
    <main className="min-h-screen bg-secondary/50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="h-4 w-4" />}>
                Home
              </Button>
            </Link>
            <h1 className="font-display text-xl font-bold">Dashboard</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {transactions.length.toLocaleString()} transactions
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            {/* Baseline: a spinner and nothing else while 10k rows download. */}
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Net position"
                value={formatCurrency(net)}
                change="vs. Jan 2025"
                trend={net >= 0 ? "up" : "down"}
                icon={<Wallet className="h-5 w-5" />}
              />
              <StatCard
                label="Total income"
                value={formatCurrency(income)}
                trend="up"
                icon={<ArrowUpRight className="h-5 w-5" />}
              />
              <StatCard
                label="Total spending"
                value={formatCurrency(spend)}
                trend="down"
                icon={<ArrowDownRight className="h-5 w-5" />}
              />
              <StatCard
                label="Savings rate"
                value={`${savingsRate.toFixed(1)}%`}
                trend={savingsRate > 0 ? "up" : "down"}
                icon={<PiggyBank className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="min-w-0 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Cash flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <SpendingChart data={monthly} />
                  </div>
                </CardContent>
              </Card>
              <Card className="min-w-0 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Spending by category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <CategoryChart data={categorySlices} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>
                    Transactions{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filtered.length.toLocaleString()})
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
                <TransactionsTable
                  transactions={filtered}
                  onSelect={setSelected}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <TransactionDrawer
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
