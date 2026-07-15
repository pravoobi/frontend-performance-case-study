// Pass 3: moment.js (~70 KB min+gzip) replaced with the platform's Intl
// APIs — zero bundle cost, same output. Formatters are hoisted so they're
// constructed once, not per call (Intl constructors are expensive).
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return monthFormat.format(new Date(iso));
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // "YYYY-MM" straight from the ISO string
}

export function formatCurrency(amount: number): string {
  return currencyFormat.format(amount);
}
