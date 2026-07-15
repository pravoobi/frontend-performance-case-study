import moment from "moment";

// Baseline: moment.js is pulled into the client bundle just to format
// dates and currency — ~70 KB min+gzip for what Intl does natively.
export function formatDate(iso: string): string {
  return moment(iso).format("MMM D, YYYY");
}

export function formatMonth(iso: string): string {
  return moment(iso).format("MMM YY");
}

export function monthKey(iso: string): string {
  return moment(iso).format("YYYY-MM");
}

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
