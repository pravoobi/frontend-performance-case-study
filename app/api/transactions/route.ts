import { NextResponse } from "next/server";
import { generateTransactions } from "@/lib/transactions";

// Pass 9: the dataset is deterministic, so the response is safely
// cacheable — repeat visits read the browser's HTTP cache, CDNs can hold
// it for an hour, and stale-while-revalidate keeps even expired hits fast.
export async function GET() {
  const transactions = generateTransactions();
  return NextResponse.json(transactions, {
    headers: {
      "Cache-Control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
