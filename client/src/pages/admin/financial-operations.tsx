import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import PerformanceCard from "@/components/admin/PerformanceCard";

interface RevenueDataPoint {
  date: string;
  incoming: number;
  outgoing: number;
}

interface FinancialBreakdown {
  customerPayments: number;
  serviceFees: number;
  instantPayoutFees: number;
  driverWeeklyPayouts: number;
  driverInstantPayouts: number;
  refundsProcessed: number;
}

interface FinancialOperationsData {
  availableBalance: number;
  pendingBalance: number;
  totalPayouts: number;
  revenueData: RevenueDataPoint[];
  breakdown: FinancialBreakdown;
  netPosition: number;
  netPositionPercentage: number;
}

export default function FinancialOperations() {
  const { data: financial, isLoading, isError } = useQuery<FinancialOperationsData>({
    queryKey: ['/api/admin/financial-operations'],
    refetchInterval: 60000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const totalIncoming = financial?.breakdown 
    ? financial.breakdown.customerPayments + financial.breakdown.serviceFees + financial.breakdown.instantPayoutFees
    : 0;

  const totalOutgoing = financial?.breakdown
    ? financial.breakdown.driverWeeklyPayouts + financial.breakdown.driverInstantPayouts + financial.breakdown.refundsProcessed
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Financial Operations</h1>
        <p className="text-muted-foreground">Comprehensive financial management and reporting</p>
      </div>

      {/* Financial Overview Cards */}
      {isError ? (
        <Card className="border-red-200" data-testid="error-metrics">
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium mb-2">Failed to load financial metrics</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PerformanceCard
            title="Available Balance"
            value={isLoading ? "..." : financial ? formatCurrency(financial.availableBalance) : "N/A"}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            testId="metric-available-balance"
          />
          <PerformanceCard
            title="Pending Balance"
            value={isLoading ? "..." : financial ? formatCurrency(financial.pendingBalance) : "N/A"}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            testId="metric-pending-balance"
          />
          <PerformanceCard
            title="Total Payouts"
            value={isLoading ? "..." : financial ? formatCurrency(financial.totalPayouts) : "N/A"}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            testId="metric-total-payouts"
          />
        </div>
      )}

      {/* Revenue vs Payouts Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue vs Payouts (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-revenue-data">
              <p className="text-muted-foreground">Loading financial data...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-revenue-data">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Failed to load revenue data</p>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : !financial?.revenueData || financial.revenueData.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-revenue-data">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No revenue data available</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financial.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="incoming" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Incoming Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outgoing" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Outgoing Payouts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Incoming Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-incoming">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8" data-testid="error-incoming">
                <p className="text-red-600">Failed to load data</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Customer Payments</span>
                    <span className="font-bold text-green-600" data-testid="amount-customer-payments">
                      {formatCurrency(financial?.breakdown?.customerPayments || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Service Fees</span>
                    <span className="font-bold text-green-600" data-testid="amount-service-fees">
                      {formatCurrency(financial?.breakdown?.serviceFees || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Instant Payout Fees</span>
                    <span className="font-bold text-green-600" data-testid="amount-instant-fees">
                      {formatCurrency(financial?.breakdown?.instantPayoutFees || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-green-100 border-2 border-green-300">
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-semibold">Total Incoming</span>
                    <span className="text-xl font-bold text-green-700" data-testid="total-incoming">
                      {formatCurrency(totalIncoming)}
                    </span>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
              Outgoing Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-outgoing">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8" data-testid="error-outgoing">
                <p className="text-red-600">Failed to load data</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Driver Weekly Payouts</span>
                    <span className="font-bold text-red-600" data-testid="amount-weekly-payouts">
                      {formatCurrency(financial?.breakdown?.driverWeeklyPayouts || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Driver Instant Payouts</span>
                    <span className="font-bold text-red-600" data-testid="amount-instant-payouts">
                      {formatCurrency(financial?.breakdown?.driverInstantPayouts || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">Refunds Processed</span>
                    <span className="font-bold text-red-600" data-testid="amount-refunds">
                      {formatCurrency(financial?.breakdown?.refundsProcessed || 0)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-red-100 border-2 border-red-300">
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-semibold">Total Outgoing</span>
                    <span className="text-xl font-bold text-red-700" data-testid="total-outgoing">
                      {formatCurrency(totalOutgoing)}
                    </span>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net Position */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle>Net Financial Position</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-net-position">
              <p className="text-muted-foreground">Loading net position...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8" data-testid="error-net-position">
              <p className="text-red-600">Failed to load net position</p>
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-[#B8956A]/10 to-[#A0805A]/10 border-[#B8956A]/30">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weekly Net Position</p>
                  <p className="text-4xl font-bold text-green-600" data-testid="net-position">
                    +{formatCurrency(financial?.netPosition || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue exceeds payouts by {financial?.netPositionPercentage?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="bg-green-500 text-white rounded-full p-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
