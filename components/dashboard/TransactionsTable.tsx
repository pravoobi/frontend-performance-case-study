"use client";

// Pass 6: the table is virtualized with TanStack Virtual — only the rows in
// (and just around) the viewport are mounted, so 10,000 filtered rows cost
// the same as 20. Header and rows share one grid template so columns stay
// aligned without <table> layout.
import { memo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@practics/ui";
import type { Transaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
} as const;

const GRID_TEMPLATE = "minmax(110px,0.9fr) minmax(150px,1.4fr) minmax(120px,1fr) minmax(160px,1.2fr) minmax(110px,0.9fr) minmax(110px,0.9fr)";
const ROW_HEIGHT = 53;

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
      <span className="truncate font-medium">{row.original.merchant}</span>
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
      <span className="truncate text-muted-foreground">
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
    header: () => <span className="block w-full text-right">Amount</span>,
    cell: ({ row }) => (
      <span
        className={`block w-full whitespace-nowrap text-right font-medium tabular-nums ${
          row.original.amount > 0 ? "text-success" : ""
        }`}
      >
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
];

// Pass 7: memo() skips re-rendering the table when the parent re-renders
// for reasons that don't change its props (e.g. drawer open/close —
// `filtered` is memoized upstream and setSelected is identity-stable).
export const TransactionsTable = memo(function TransactionsTable({
  transactions,
  onSelect,
}: {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div
          className="grid border-b border-border px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
          style={{ gridTemplateColumns: GRID_TEMPLATE }}
        >
          {table.getFlatHeaders().map((header) => (
            <div key={header.id} className="px-0.5">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </div>
        <div ref={scrollRef} className="h-[560px] overflow-y-auto">
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  onClick={() => onSelect(row.original)}
                  className="absolute left-0 grid w-full cursor-pointer items-center border-b border-border px-4 text-sm transition-colors hover:bg-muted"
                  style={{
                    gridTemplateColumns: GRID_TEMPLATE,
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="min-w-0 px-0.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
