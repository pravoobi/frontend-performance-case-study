import type { Transaction } from "./transactions";
import { formatMonth, monthKey } from "./format";

// Server-side aggregates (run at build time — the dataset is deterministic).
// Pass 3: lodash groupBy/sumBy/orderBy replaced with single-pass native
// reductions so lodash can leave the dependency tree entirely.

export interface Stats {
  income: number;
  spend: number;
  net: number;
  savingsRate: number;
}

export function computeStats(transactions: Transaction[]): Stats {
  let income = 0;
  let spend = 0;
  for (const t of transactions) {
    if (t.amount > 0) income += t.amount;
    else spend -= t.amount;
  }
  const net = income - spend;
  return {
    income,
    spend,
    net,
    savingsRate: income > 0 ? (net / income) * 100 : 0,
  };
}

export function monthlySeries(transactions: Transaction[]) {
  const byMonth = new Map<string, { date: string; spend: number; income: number }>();
  for (const t of transactions) {
    const key = monthKey(t.date);
    const bucket = byMonth.get(key) ?? { date: t.date, spend: 0, income: 0 };
    if (t.amount > 0) bucket.income += t.amount;
    else bucket.spend -= t.amount;
    byMonth.set(key, bucket);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => ({
      month: formatMonth(bucket.date),
      key,
      spend: Math.round(bucket.spend),
      income: Math.round(bucket.income),
    }));
}

export function categoryTotals(transactions: Transaction[]) {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) - t.amount);
  }
  return [...byCategory.entries()]
    .map(([category, total]) => ({ category, total: Math.round(total) }))
    .sort((a, b) => b.total - a.total);
}
