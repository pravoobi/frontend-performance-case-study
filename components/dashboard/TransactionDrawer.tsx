"use client";

import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@practics/ui";
import type { Transaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
} as const;

export function TransactionDrawer({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={transaction !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {transaction && (
          <>
            <DialogHeader>
              <DialogTitle>{transaction.merchant}</DialogTitle>
              <DialogDescription>
                {formatDate(transaction.date)} · {transaction.account}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p
                className={`text-3xl font-bold ${
                  transaction.amount > 0 ? "text-success" : "text-foreground"
                }`}
              >
                {formatCurrency(transaction.amount)}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={STATUS_VARIANT[transaction.status]}>
                    {transaction.status}
                  </Badge>
                </dd>
                <dt className="text-muted-foreground">Category</dt>
                <dd>{transaction.category}</dd>
                <dt className="text-muted-foreground">Payment method</dt>
                <dd className="uppercase">{transaction.method}</dd>
                <dt className="text-muted-foreground">Transaction ID</dt>
                <dd className="font-mono text-xs">{transaction.id}</dd>
              </dl>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
