import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import PerformanceCard from "@/components/admin/PerformanceCard";

export default function FinancialOperations() {
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    setRevenueData([
      { date: 'Mon', incoming: 450, outgoing: 320 },
      { date: 'Tue', incoming: 620, outgoing: 410 },
      { date: 'Wed', incoming: 700, outgoing: 480 },
      { date: 'Thu', incoming: 540, outgoing: 390 },
      { date: 'Fri', incoming: 860, outgoing: 600 },
      { date: 'Sat', incoming: 920, outgoing: 650 },
      { date: 'Sun', incoming: 780, outgoing: 520 },
    ]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Financial Operations</h1>
        <p className="text-muted-foreground">Comprehensive financial management and reporting</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceCard
          title="Available Balance"
          value="$2,450.00"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          testId="metric-available-balance"
        />
        <PerformanceCard
          title="Pending Balance"
          value="$650.00"
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          testId="metric-pending-balance"
        />
        <PerformanceCard
          title="Total Payouts"
          value="$12,890.00"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          testId="metric-total-payouts"
        />
      </div>

      {/* Revenue vs Payouts Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue vs Payouts (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium">Customer Payments</span>
                <span className="font-bold text-green-600">$3,120.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium">Service Fees</span>
                <span className="font-bold text-green-600">$890.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium">Instant Payout Fees</span>
                <span className="font-bold text-green-600">$48.50</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                <span className="font-semibold">Total Incoming</span>
                <span className="text-xl font-bold text-green-700">$4,058.50</span>
              </div>
            </div>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium">Driver Weekly Payouts</span>
                <span className="font-bold text-red-600">$1,890.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium">Driver Instant Payouts</span>
                <span className="font-bold text-red-600">$450.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium">Refunds Processed</span>
                <span className="font-bold text-red-600">$125.00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                <span className="font-semibold">Total Outgoing</span>
                <span className="text-xl font-bold text-red-700">$2,465.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Position */}
      <Card className="border-[#B8956A]">
        <CardHeader>
          <CardTitle>Net Financial Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#B8956A]/10 to-[#A0805A]/10 border border-[#B8956A]/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Weekly Net Position</p>
              <p className="text-4xl font-bold text-green-600">+$1,593.50</p>
              <p className="text-xs text-muted-foreground mt-1">Revenue exceeds payouts by 64.7%</p>
            </div>
            <div className="bg-green-500 text-white rounded-full p-4">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
