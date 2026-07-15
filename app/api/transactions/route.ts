import { NextResponse } from "next/server";
import { generateTransactions } from "@/lib/transactions";

// Baseline: ships the entire 10k-row dataset in one uncached response.
export async function GET() {
  const transactions = generateTransactions();
  return NextResponse.json(transactions);
}
