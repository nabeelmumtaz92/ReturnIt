import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Send
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminTax1099() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1); // Default to previous year
  const [generatingBulk, setGeneratingBulk] = useState(false);

  // Available tax years (current year and 5 years back)
  const taxYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fetch tax year summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/admin/tax/1099/summary', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/admin/tax/1099/summary/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },
  });

  // Fetch drivers requiring 1099
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useQuery({
    queryKey: ['/api/admin/tax/1099/drivers', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/admin/tax/1099/drivers/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      return response.json();
    },
  });

  // Generate single 1099 mutation
  const generateSingleMutation = useMutation({
    mutationFn: async ({ driverId, taxYear }: { driverId: number; taxYear: number }) => {
      return apiRequest('POST', '/api/admin/tax/1099/generate', { driverId, taxYear });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: '1099 generated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tax/1099/drivers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tax/1099/summary', selectedYear] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate 1099',
        variant: 'destructive',
      });
    },
  });

  // Bulk generate mutation
  const handleBulkGenerate = async (forceRegenerate = false) => {
    try {
      setGeneratingBulk(true);
      const response = await apiRequest('POST', '/api/admin/tax/1099/generate-bulk', {
        taxYear: selectedYear,
        forceRegenerate,
      });

      toast({
        title: 'Bulk Generation Complete',
        description: `Generated: ${response.results.generated}, Skipped: ${response.results.skipped}, Failed: ${response.results.failed}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/admin/tax/1099/drivers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tax/1099/summary', selectedYear] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Bulk generation failed',
        variant: 'destructive',
      });
    } finally {
      setGeneratingBulk(false);
    }
  };

  const handleDownload = async (driverId: number) => {
    try {
      const response = await fetch(`/api/tax/1099/download/${driverId}/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to get download URL');
      
      const data = await response.json();
      window.open(data.pdfUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download 1099',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">1099 Tax Form Management</h1>
          <p className="text-gray-600">Generate and manage 1099-NEC forms for drivers</p>
        </div>

        {/* Year Selector */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-amber-600" />
                <div>
                  <label className="text-sm font-medium mb-1 block">Tax Year</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-40" data-testid="select-tax-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetchDrivers()}
                  disabled={driversLoading}
                  data-testid="button-refresh"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${driversLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => handleBulkGenerate(false)}
                  disabled={generatingBulk || driversLoading}
                  data-testid="button-bulk-generate"
                >
                  {generatingBulk ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Drivers</p>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold">{summary.driversEligible}</p>
                <p className="text-xs text-gray-500 mt-1">Earned ≥$600</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold">${summary.totalEarningsPaid.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">Paid to drivers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Forms Generated</p>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold">{summary.formsGenerated}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.driversEligible > 0
                    ? `${Math.round((summary.formsGenerated / summary.driversEligible) * 100)}%`
                    : '0%'}{' '}
                  complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Forms Pending</p>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-3xl font-bold">{summary.formsPending}</p>
                <p className="text-xs text-gray-500 mt-1">Need generation</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Drivers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Drivers Requiring 1099-NEC for {selectedYear}</CardTitle>
            <CardDescription>
              IRS requires 1099-NEC for all contractors earning $600 or more
            </CardDescription>
          </CardHeader>
          <CardContent>
            {driversLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-amber-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading drivers...</p>
              </div>
            ) : !drivers || drivers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No drivers meet the $600 threshold for tax year {selectedYear}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Total Earnings</TableHead>
                      <TableHead className="text-right">Payouts</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver: any) => (
                      <TableRow key={driver.driverId}>
                        <TableCell className="font-medium">
                          {driver.driverInfo.firstName} {driver.driverInfo.lastName}
                          <div className="text-xs text-gray-500">ID: {driver.driverId}</div>
                        </TableCell>
                        <TableCell>{driver.driverInfo.email}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${driver.totalEarnings.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div>{driver.payoutCount}</div>
                          <div className="text-xs text-gray-500">
                            {driver.instantPayouts} instant, {driver.weeklyPayouts} weekly
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Eligible
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(driver.driverId)}
                              disabled={generateSingleMutation.isPending}
                              data-testid={`button-download-${driver.driverId}`}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                generateSingleMutation.mutate({
                                  driverId: driver.driverId,
                                  taxYear: selectedYear,
                                })
                              }
                              disabled={generateSingleMutation.isPending}
                              data-testid={`button-generate-${driver.driverId}`}
                            >
                              {generateSingleMutation.isPending ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              Generate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">1099-NEC Requirements</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• IRS requires 1099-NEC for non-employees earning $600 or more</li>
                  <li>• Forms must be provided to drivers by January 31</li>
                  <li>• Filed with IRS by the same deadline</li>
                  <li>• Includes all payments made during the calendar year</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
