import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Download, RefreshCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import StatusBadge from "@/components/admin/StatusBadge";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  userId?: number;
  orderId?: number;
  stripePaymentId?: string | null;
}

export default function Transactions() {
  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { className: string }> = {
      payment: { className: 'bg-green-100 text-green-700' },
      refund: { className: 'bg-red-100 text-red-700' },
      payout: { className: 'bg-blue-100 text-blue-700' },
    };
    const config = typeMap[type.toLowerCase()] || { className: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.className}>{type.toUpperCase()}</Badge>;
  };

  const exportToExcel = () => {
    if (!transactions || transactions.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(
      transactions.map(t => ({
        ID: t.id,
        Type: t.type,
        Amount: t.amount,
        Status: t.status,
        Date: t.date,
        'Order ID': t.orderId || 'N/A',
        'Stripe ID': t.stripePaymentId || 'N/A'
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
          <p className="text-muted-foreground">View all payment transactions and history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="default" data-testid="button-export-transactions">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} variant="outline" data-testid="button-refresh-transactions">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Stripe ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={transaction.status} variant="payment" />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {transaction.orderId ? `#${transaction.orderId}` : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {transaction.stripePaymentId || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
