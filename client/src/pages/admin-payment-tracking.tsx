import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Download, DollarSign, FileSpreadsheet, Filter, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/AdminLayout";

interface PaymentRecord {
  id: string;
  orderId: string;
  transactionDate: Date;
  driverEarnings: {
    basePay: number;
    distancePay: number;
    timePay: number;
    sizeBonus: number;
    tip: number;
    total: number;
  };
  companyRevenue: {
    serviceFee: number;
    distanceFee: number;
    timeFee: number;
    total: number;
  };
  customerPayment: {
    basePrice: number;
    surcharges: number;
    taxes: number;
    total: number;
  };
  driverId: number;
  driverName: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  taxYear: number;
  quarter: number;
}

export default function AdminPaymentTracking() {
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real payment data from API
  const { data: paymentRecords = [], isLoading } = useQuery<PaymentRecord[]>({
    queryKey: ["/api/admin/payment-records", dateFilter, statusFilter],
    enabled: true, // Enable API call to fetch real data
  });

  const { data: paymentSummary = {} } = useQuery({
    queryKey: ["/api/admin/payment-summary"],
    enabled: true, // Enable API call to fetch real data
  });

  const filteredRecords = paymentRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Function to convert data to CSV format
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');
    return csvContent;
  };

  // Function to trigger download
  const downloadFile = (content: string, filename: string, type: string = 'text/csv') => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportToExcel = async () => {
    try {
      // Generate CSV data from the filtered records
      const exportData = filteredRecords.map(record => ({
        order_id: record.orderId,
        transaction_date: format(new Date(record.transactionDate), 'yyyy-MM-dd HH:mm:ss'),
        driver_name: record.driverName,
        driver_id: record.driverId,
        status: record.status,
        payment_method: record.paymentMethod,
        customer_total: record.customerPayment.total.toFixed(2),
        customer_base_price: record.customerPayment.basePrice.toFixed(2),
        customer_surcharges: record.customerPayment.surcharges.toFixed(2),
        customer_taxes: record.customerPayment.taxes.toFixed(2),
        driver_total_earnings: record.driverEarnings.total.toFixed(2),
        driver_base_pay: record.driverEarnings.basePay.toFixed(2),
        driver_distance_pay: record.driverEarnings.distancePay.toFixed(2),
        driver_time_pay: record.driverEarnings.timePay.toFixed(2),
        driver_size_bonus: record.driverEarnings.sizeBonus.toFixed(2),
        driver_tip: record.driverEarnings.tip.toFixed(2),
        company_total_revenue: record.companyRevenue.total.toFixed(2),
        company_service_fee: record.companyRevenue.serviceFee.toFixed(2),
        company_distance_fee: record.companyRevenue.distanceFee.toFixed(2),
        company_time_fee: record.companyRevenue.timeFee.toFixed(2),
        tax_year: record.taxYear,
        quarter: record.quarter
      }));

      const headers = Object.keys(exportData[0] || {});
      const filename = `payment-records-${dateFilter}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      const csvContent = convertToCSV(exportData, headers);
      downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const generateTaxReport = async (year: number = new Date().getFullYear()) => {
    try {
      // Generate comprehensive tax report data
      const taxReportData = paymentRecords
        .filter(record => record.taxYear === year)
        .map(record => ({
          tax_year: year,
          order_id: record.orderId,
          transaction_date: format(new Date(record.transactionDate), 'yyyy-MM-dd'),
          driver_name: record.driverName,
          driver_id: record.driverId,
          quarter: record.quarter,
          driver_1099_compensation: record.driverEarnings.total.toFixed(2),
          federal_tax_withheld: '0.00', // Independent contractors
          state_tax_withheld: '0.00',
          backup_withholding: '0.00',
          payer_name: 'Return It Logistics LLC',
          payer_tin: '12-3456789',
          payer_address: '123 Business Ave, City, State 12345',
          recipient_address: 'Driver Address (To be filled)',
          form_1099_required: record.driverEarnings.total >= 600 ? 'Yes' : 'No'
        }));

      // Add summary data
      const summaryData = [{
        report_type: 'Tax Summary',
        tax_year: year,
        total_drivers_requiring_1099: taxReportData.filter(r => r.form_1099_required === 'Yes').length,
        total_1099_compensation: taxReportData.reduce((sum, r) => sum + parseFloat(r.driver_1099_compensation), 0).toFixed(2),
        total_transactions: taxReportData.length,
        q1_compensation: taxReportData.filter(r => r.quarter === 1).reduce((sum, r) => sum + parseFloat(r.driver_1099_compensation), 0).toFixed(2),
        q2_compensation: taxReportData.filter(r => r.quarter === 2).reduce((sum, r) => sum + parseFloat(r.driver_1099_compensation), 0).toFixed(2),
        q3_compensation: taxReportData.filter(r => r.quarter === 3).reduce((sum, r) => sum + parseFloat(r.driver_1099_compensation), 0).toFixed(2),
        q4_compensation: taxReportData.filter(r => r.quarter === 4).reduce((sum, r) => sum + parseFloat(r.driver_1099_compensation), 0).toFixed(2),
        report_generated: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }];

      const combinedData = [...summaryData, ...taxReportData];
      const headers = Object.keys(combinedData[0]);
      const filename = `tax-report-${year}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      const csvContent = convertToCSV(combinedData, headers);
      downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('Tax report generation failed:', error);
    }
  };

  const generate1099Forms = async (year: number = new Date().getFullYear()) => {
    try {
      // Generate 1099-NEC forms data
      const forms1099 = paymentRecords
        .filter(record => record.taxYear === year && record.driverEarnings.total >= 600)
        .reduce((acc, record) => {
          const driverId = record.driverId;
          if (!acc[driverId]) {
            acc[driverId] = {
              driver_id: driverId,
              driver_name: record.driverName,
              tax_year: year,
              total_compensation: 0,
              quarters: { q1: 0, q2: 0, q3: 0, q4: 0 },
              form_type: '1099-NEC',
              payer_info: {
                name: 'Return It Logistics LLC',
                tin: '12-3456789',
                address: '123 Business Ave, City, State 12345',
                phone: '(555) 123-4567'
              }
            };
          }
          acc[driverId].total_compensation += record.driverEarnings.total;
          acc[driverId].quarters[`q${record.quarter}`] += record.driverEarnings.total;
          return acc;
        }, {});

      const formsData = Object.values(forms1099).map((form: any) => ({
        ...form,
        total_compensation: form.total_compensation.toFixed(2),
        q1_compensation: form.quarters.q1.toFixed(2),
        q2_compensation: form.quarters.q2.toFixed(2),
        q3_compensation: form.quarters.q3.toFixed(2),
        q4_compensation: form.quarters.q4.toFixed(2),
        federal_tax_withheld: '0.00',
        state_tax_withheld: '0.00',
        backup_withholding: '0.00',
        generated_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }));

      const headers = Object.keys(formsData[0] || {}).filter(key => key !== 'quarters');
      const filename = `1099-nec-forms-${year}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      const csvContent = convertToCSV(formsData, headers);
      downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('1099 forms generation failed:', error);
    }
  };

  const exportAllTaxData = async () => {
    try {
      // Comprehensive tax data export
      const allTaxData = paymentRecords.map(record => ({
        record_id: record.id,
        order_id: record.orderId,
        transaction_date: format(new Date(record.transactionDate), 'yyyy-MM-dd HH:mm:ss'),
        tax_year: record.taxYear,
        quarter: record.quarter,
        driver_id: record.driverId,
        driver_name: record.driverName,
        status: record.status,
        payment_method: record.paymentMethod,
        // Customer payments
        customer_total: record.customerPayment.total.toFixed(2),
        customer_base_price: record.customerPayment.basePrice.toFixed(2),
        customer_surcharges: record.customerPayment.surcharges.toFixed(2),
        customer_taxes: record.customerPayment.taxes.toFixed(2),
        // Driver 1099 reportable income
        driver_1099_compensation: record.driverEarnings.total.toFixed(2),
        driver_base_pay: record.driverEarnings.basePay.toFixed(2),
        driver_distance_pay: record.driverEarnings.distancePay.toFixed(2),
        driver_time_pay: record.driverEarnings.timePay.toFixed(2),
        driver_size_bonus: record.driverEarnings.sizeBonus.toFixed(2),
        driver_tip: record.driverEarnings.tip.toFixed(2),
        // Company revenue  
        company_total_revenue: record.companyRevenue.total.toFixed(2),
        company_service_fee: record.companyRevenue.serviceFee.toFixed(2),
        company_distance_fee: record.companyRevenue.distanceFee.toFixed(2),
        company_time_fee: record.companyRevenue.timeFee.toFixed(2),
        // Tax calculations
        requires_1099: record.driverEarnings.total >= 600 ? 'Yes' : 'No',
        estimated_driver_tax_liability: (record.driverEarnings.total * 0.25).toFixed(2),
        company_tax_deduction: record.driverEarnings.total.toFixed(2),
        export_timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }));

      const headers = Object.keys(allTaxData[0] || {});
      const filename = `complete-tax-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      const csvContent = convertToCSV(allTaxData, headers);
      downloadFile(csvContent, filename);
      
    } catch (error) {
      console.error('Tax data export failed:', error);
    }
  };

  const paymentTabs = [
    {
      label: "Payment Records",
      href: "/admin-payment-tracking",
      current: true
    },
    {
      label: "Tax Reports",
      href: "/admin-payment-tracking#tax",
      current: false
    },
    {
      label: "Driver Payouts", 
      href: "/admin-payment-tracking#payouts",
      current: false
    }
  ];

  return (
    <AdminLayout
      pageTitle="Payment Tracking & Tax Management"
      tabs={paymentTabs}
    >
      <div className="max-w-7xl mx-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Total Driver Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ${paymentSummary?.totalDriverEarnings?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Company Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                ${paymentSummary?.totalCompanyRevenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-blue-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-600">Customer Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                ${paymentSummary?.totalCustomerPayments?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-purple-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-primary">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {paymentSummary?.totalTransactions || 0}
              </div>
              <p className="text-xs text-primary mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="records">Payment Records</TabsTrigger>
            <TabsTrigger value="analytics">Tax Analytics</TabsTrigger>
            <TabsTrigger value="exports">Reports & Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Orders/Drivers</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Order ID or driver name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-payments"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-filter">Date Range</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger data-testid="select-date-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status-filter">Payment Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleExportToExcel}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="button-export-excel"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Records Table */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Payment Records ({filteredRecords.length})</CardTitle>
                <CardDescription>
                  Detailed breakdown of all payments for tax reporting and financial analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading payment records...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No payment records found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-semibold text-sm">Order {record.orderId}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(record.transactionDate), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                            <Badge variant={record.status === 'completed' ? 'default' : record.status === 'pending' ? 'secondary' : 'destructive'}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${record.customerPayment.total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{record.paymentMethod}</div>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {/* Driver Earnings */}
                          <div className="space-y-2">
                            <div className="font-medium text-green-700">Driver: {record.driverName}</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Base Pay:</span>
                                <span>${record.driverEarnings.basePay.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Distance Pay:</span>
                                <span>${record.driverEarnings.distancePay.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time Pay:</span>
                                <span>${record.driverEarnings.timePay.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Size Bonus:</span>
                                <span>${record.driverEarnings.sizeBonus.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tip:</span>
                                <span>${record.driverEarnings.tip.toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Total Earnings:</span>
                                <span>${record.driverEarnings.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Company Revenue */}
                          <div className="space-y-2">
                            <div className="font-medium text-blue-700">Company Revenue</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Service Fee:</span>
                                <span>${record.companyRevenue.serviceFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Distance Fee:</span>
                                <span>${record.companyRevenue.distanceFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time Fee:</span>
                                <span>${record.companyRevenue.timeFee.toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Total Revenue:</span>
                                <span>${record.companyRevenue.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Customer Payment */}
                          <div className="space-y-2">
                            <div className="font-medium text-purple-700">Customer Payment</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Base Price:</span>
                                <span>${record.customerPayment.basePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Surcharges:</span>
                                <span>${record.customerPayment.surcharges.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Taxes:</span>
                                <span>${record.customerPayment.taxes.toFixed(2)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Total Paid:</span>
                                <span>${record.customerPayment.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Driver Payments (1099)</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${paymentSummary?.monthlyDriverPayments?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Company Revenue</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${paymentSummary?.monthlyCompanyRevenue?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Tax Rate Applied:</span>
                        <span>8.99%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax Liability:</span>
                        <span>${((paymentSummary?.monthlyCompanyRevenue || 0) * 0.0899).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tax Year Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground">2024</div>
                      <div className="text-sm text-gray-600">Current Tax Year</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Q1 Revenue:</span>
                        <span>${paymentSummary?.q1Revenue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q2 Revenue:</span>
                        <span>${paymentSummary?.q2Revenue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q3 Revenue:</span>
                        <span>${paymentSummary?.q3Revenue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q4 Revenue:</span>
                        <span>${paymentSummary?.q4Revenue?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => generateTaxReport(2024)}
                      className="w-full"
                      variant="outline"
                      data-testid="button-generate-tax-report"
                    >
                      Generate 2024 Tax Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Excel Reports
                  </CardTitle>
                  <CardDescription>
                    Export payment data in Excel format for accounting software
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleExportToExcel}
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-export-all-payments"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Payment Records
                  </Button>
                  
                  <Button 
                    onClick={() => generateTaxReport(2024)}
                    className="w-full"
                    variant="outline"
                    data-testid="button-export-tax-summary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Tax Summary (1099 Ready)
                  </Button>
                  
                  <Button 
                    onClick={() => apiRequest("POST", "/api/admin/export-quarterly", { year: 2024 })}
                    className="w-full"
                    variant="outline"
                    data-testid="button-export-quarterly"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Quarterly Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Driver 1099 Management
                  </CardTitle>
                  <CardDescription>
                    Track driver earnings for tax form generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Active Drivers (2024):</span>
                      <span className="font-medium">{paymentSummary?.activeDriversCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Driver Payments:</span>
                      <span className="font-medium">${paymentSummary?.totalDriverPayments?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drivers Exceeding $600:</span>
                      <span className="font-medium">{paymentSummary?.driversRequiring1099 || 0}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => apiRequest("POST", "/api/admin/generate-1099s", { year: 2024 })}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-generate-1099s"
                  >
                    Generate 1099 Forms
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}