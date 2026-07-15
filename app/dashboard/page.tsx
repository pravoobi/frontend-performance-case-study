// Pass 2: the dashboard shell is a Server Component. The stats and chart
// series are computed on the server at build time (the dataset is
// deterministic), so the numbers arrive as static HTML — no client fetch,
// no aggregate computation, and none of that code in the client bundle.
// Only the interactive transactions section remains a client island.
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatCard,
} from "@practics/ui";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { generateTransactions } from "@/lib/transactions";
import { categoryTotals, computeStats, monthlySeries } from "@/lib/aggregate";
import { formatCurrency } from "@/lib/format";
import { TransactionsSection } from "@/components/dashboard/TransactionsSection";
// Note: the charts are NOT dynamic()-imported, deliberately. They render
// above the fold on initial load, so code-splitting them buys nothing —
// and measurably hurts: the split chunk landed in the shared chunk group
// (recharts started loading on the landing page too) and its delayed
// hydration forced a layout pass after the 10k-row table had mounted,
// adding a multi-second long task. Split what loads on interaction (the
// drawer); keep what renders immediately in the route bundle.
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";

export const metadata = {
  title: "Dashboard — FinDash",
};

export default function DashboardPage() {
  const transactions = generateTransactions();
  const stats = computeStats(transactions);
  const monthly = monthlySeries(transactions);
  const categories = categoryTotals(transactions);

  return (
    <main className="min-h-screen bg-secondary/50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<ArrowLeft className="h-4 w-4" />}
              >
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Net position"
            value={formatCurrency(stats.net)}
            change="vs. Jan 2025"
            trend={stats.net >= 0 ? "up" : "down"}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            label="Total income"
            value={formatCurrency(stats.income)}
            trend="up"
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <StatCard
            label="Total spending"
            value={formatCurrency(stats.spend)}
            trend="down"
            icon={<ArrowDownRight className="h-5 w-5" />}
          />
          <StatCard
            label="Savings rate"
            value={`${stats.savingsRate.toFixed(1)}%`}
            trend={stats.savingsRate > 0 ? "up" : "down"}
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
                <CategoryChart data={categories} />
              </div>
            </CardContent>
          </Card>
        </div>

        <TransactionsSection />
      </div>
    </main>
  );
}
