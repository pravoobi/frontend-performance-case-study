"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MonthlyPoint {
  month: string;
  spend: number;
  income: number;
}

export function SpendingChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          formatter={(value) => `$${Number(value).toLocaleString()}`}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
        />
        {/* Animations stay off so the deliberately huge table below doesn't
            starve the animation loop — the baseline must be slow, not hung. */}
        <Area
          type="monotone"
          dataKey="income"
          stroke="#059669"
          strokeWidth={2}
          fill="url(#incomeFill)"
          name="Income"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#4f46e5"
          strokeWidth={2}
          fill="url(#spendFill)"
          name="Spending"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
