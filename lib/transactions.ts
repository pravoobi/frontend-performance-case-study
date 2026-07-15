export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  date: string; // ISO 8601
  merchant: string;
  category: string;
  amount: number; // negative = spend, positive = income
  status: TransactionStatus;
  account: string;
  method: string;
}

const MERCHANTS: Record<string, string[]> = {
  Groceries: ["Whole Foods", "Trader Joe's", "Safeway", "Costco", "Kroger"],
  Dining: ["Chipotle", "Starbucks", "Sweetgreen", "Local Thai", "Blue Bottle"],
  Transport: ["Uber", "Lyft", "Shell", "Chevron", "BART Clipper"],
  Shopping: ["Amazon", "Target", "Best Buy", "IKEA", "Uniqlo"],
  Utilities: ["PG&E", "Comcast", "AT&T", "Water District", "Recology"],
  Entertainment: ["Netflix", "Spotify", "AMC Theatres", "Steam", "HBO Max"],
  Health: ["CVS Pharmacy", "Kaiser", "24 Hour Fitness", "One Medical"],
  Travel: ["United Airlines", "Airbnb", "Marriott", "Hertz", "Expedia"],
  Income: ["Acme Corp Payroll", "Freelance Invoice", "Interest Payment", "Dividend"],
};

const CATEGORIES = Object.keys(MERCHANTS);
const ACCOUNTS = ["Everyday Checking", "Rewards Credit", "High-Yield Savings"];
const METHODS = ["card", "ach", "wire", "apple-pay"];

// Deterministic PRNG (mulberry32) so the dataset is identical on every
// machine and every run — measurements stay reproducible.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TRANSACTION_COUNT = 10_000;

export function generateTransactions(count = TRANSACTION_COUNT): Transaction[] {
  const rand = mulberry32(20260715);
  const start = Date.UTC(2025, 0, 1);
  const span = Date.UTC(2026, 6, 1) - start;

  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    const merchants = MERCHANTS[category];
    const merchant = merchants[Math.floor(rand() * merchants.length)];
    const isIncome = category === "Income";
    const magnitude = isIncome
      ? 800 + rand() * 4200
      : 3 + rand() * (category === "Travel" ? 900 : 220);
    const statusRoll = rand();
    const status: TransactionStatus =
      statusRoll < 0.9 ? "completed" : statusRoll < 0.97 ? "pending" : "failed";

    transactions.push({
      id: `txn_${(i + 1).toString().padStart(5, "0")}`,
      date: new Date(start + rand() * span).toISOString(),
      merchant,
      category,
      amount: Math.round((isIncome ? magnitude : -magnitude) * 100) / 100,
      status,
      account: ACCOUNTS[Math.floor(rand() * ACCOUNTS.length)],
      method: METHODS[Math.floor(rand() * METHODS.length)],
    });
  }

  transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
  return transactions;
}
