import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PaymentRecord {
  id: number;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  stripePaymentIntentId: string;
  createdAt: string;
}

export default function PaymentTracking() {
  const { data: payments, isLoading } = useQuery<PaymentRecord[]>({
    queryKey: ['/api/admin/payment-records'],
    refetchInterval: 30000,
  });

  const { data: summary } = useQuery<{ total: number; completed: number; pending: number; failed: number; refunded: number }>({
    queryKey: ['/api/admin/payment-summary'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string }> = {
      completed: { className: 'bg-green-100 text-green-700' },
      pending: { className: 'bg-yellow-100 text-yellow-700' },
      failed: { className: 'bg-red-100 text-red-700' },
      refunded: { className: 'bg-orange-100 text-orange-700' },
    };
    const config = statusMap[status] || { className: '' };
    return <Badge className={config.className}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Reconciliation</h1>
        <p className="text-muted-foreground">Track and reconcile all payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold" data-testid="stat-total">
                  {summary ? summary.total : "..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-completed">
                  {summary ? summary.completed : "..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">
                  {summary ? summary.pending : "..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed/Refunded</p>
                <p className="text-2xl font-bold text-red-600" data-testid="stat-failed">
                  {summary ? summary.failed + summary.refunded : "..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment records found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe Payment Intent</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell className="font-mono">#{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.stripePaymentIntentId?.substring(0, 20)}...</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</TableCell>
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
