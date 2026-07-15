"use client";

// Baseline: every filtered row (up to 10,000) is mounted into the DOM at
// once — no virtualization, no pagination.
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@practics/ui";
import type { Transaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
} as const;

export function TransactionsTable({
  transactions,
  onSelect,
}: {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
}) {
  // Baseline: columns are re-created on every render, defeating TanStack
  // Table's internal memoization.
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "merchant",
      header: "Merchant",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.merchant}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.category}</Badge>
      ),
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.account}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <span className="block text-right">Amount</span>,
      cell: ({ row }) => (
        <span
          className={`block whitespace-nowrap text-right font-medium tabular-nums ${
            row.original.amount > 0 ? "text-success" : ""
          }`}
        >
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold text-muted-foreground"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onSelect(row.original)}
              className="cursor-pointer border-b border-border transition-colors hover:bg-muted"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
