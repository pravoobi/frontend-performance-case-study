import groupBy from "lodash/groupBy";
import sumBy from "lodash/sumBy";
import orderBy from "lodash/orderBy";
import type { Transaction } from "./transactions";
import { formatMonth, monthKey } from "./format";

// Pass 2: aggregates moved out of the client render path — they run on the
// server (at build time, since the dataset is deterministic).

export interface Stats {
  income: number;
  spend: number;
  net: number;
  savingsRate: number;
}

export function computeStats(transactions: Transaction[]): Stats {
  const income = sumBy(
    transactions.filter((t) => t.amount > 0),
    "amount",
  );
  const spend = -sumBy(
    transactions.filter((t) => t.amount < 0),
    "amount",
  );
  const net = income - spend;
  return {
    income,
    spend,
    net,
    savingsRate: income > 0 ? ((income - spend) / income) * 100 : 0,
  };
}

export function monthlySeries(transactions: Transaction[]) {
  const byMonth = groupBy(transactions, (t) => monthKey(t.date));
  return orderBy(Object.entries(byMonth), ([key]) => key).map(([key, txns]) => ({
    month: formatMonth(txns[0].date),
    key,
    spend: Math.round(-sumBy(txns.filter((t) => t.amount < 0), "amount")),
    income: Math.round(sumBy(txns.filter((t) => t.amount > 0), "amount")),
  }));
}

export function categoryTotals(transactions: Transaction[]) {
  const byCategory = groupBy(
    transactions.filter((t) => t.amount < 0),
    "category",
  );
  return orderBy(
    Object.entries(byCategory).map(([category, txns]) => ({
      category,
      total: Math.round(-sumBy(txns, "amount")),
    })),
    "total",
    "desc",
  );
}
