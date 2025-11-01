import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Payout {
  id: number;
  driverId: number;
  payoutType: string;
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  status: string;
  stripeTransferId: string | null;
  taxYear: number;
  createdAt: string;
  completedAt: string | null;
}

export default function Payouts() {
  const { toast } = useToast();
  const [bulkPayoutDialogOpen, setBulkPayoutDialogOpen] = useState(false);

  const { data: payouts = [], isLoading } = useQuery<Payout[]>({
    queryKey: ['/api/admin/all-payouts'],
    refetchInterval: 30000,
  });

  const totalPayouts = payouts?.length || 0;
  const totalAmount = payouts?.reduce((sum, p) => sum + p.netAmount, 0) || 0;
  const pendingPayouts = payouts?.filter(p => p.status === 'pending').length || 0;
  const completedPayouts = payouts?.filter(p => p.status === 'completed').length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-700' },
      completed: { className: 'bg-green-100 text-green-700' },
      failed: { className: 'bg-red-100 text-red-700' },
    };
    const config = statusMap[status] || { className: '' };
    return <Badge className={config.className}>{status.toUpperCase()}</Badge>;
  };

  const getPayoutTypeBadge = (type: string) => {
    const typeMap: Record<string, { className: string }> = {
      instant: { className: 'bg-purple-100 text-purple-700' },
      weekly: { className: 'bg-blue-100 text-blue-700' },
    };
    const config = typeMap[type] || { className: '' };
    return <Badge className={config.className}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Driver Payouts</h1>
        <p className="text-muted-foreground">Manage driver earnings and process payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold" data-testid="stat-total-payouts">
                  {isLoading ? "..." : totalPayouts}
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
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold" data-testid="stat-total-amount">
                  {isLoading ? "..." : formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold" data-testid="stat-pending">
                  {isLoading ? "..." : pendingPayouts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold" data-testid="stat-completed">
                  {isLoading ? "..." : completedPayouts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading payouts...</p>
            </div>
          ) : !payouts || payouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payouts found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} data-testid={`payout-row-${payout.id}`}>
                      <TableCell className="font-mono">{payout.id}</TableCell>
                      <TableCell className="font-medium">#{payout.driverId}</TableCell>
                      <TableCell>{getPayoutTypeBadge(payout.payoutType)}</TableCell>
                      <TableCell>{formatCurrency(payout.totalAmount)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(payout.feeAmount)}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(payout.netAmount)}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>{payout.taxYear}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(payout.completedAt || payout.createdAt)}
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
