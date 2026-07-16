import type { Transaction } from "./transactions";

// Shared query definition so the dashboard's useQuery and the landing
// page's hover-prefetch hit the same cache entry.
export const transactionsQuery = {
  queryKey: ["transactions"] as const,
  queryFn: async (): Promise<Transaction[]> => {
    const res = await fetch("/api/transactions");
    if (!res.ok) throw new Error(`transactions request failed: ${res.status}`);
    return res.json();
  },
};
