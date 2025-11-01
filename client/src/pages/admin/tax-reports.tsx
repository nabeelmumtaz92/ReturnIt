import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, Users } from "lucide-react";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaxReport {
  driverId: number;
  driverName: string;
  totalEarnings: number;
  form1099Generated: boolean;
  form1099Url: string | null;
}

export default function TaxReports() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: taxReports, isLoading } = useQuery<TaxReport[]>({
    queryKey: ['/api/admin/tax-reports', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/admin/tax-reports?year=${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch tax reports');
      return response.json();
    },
  });

  const generate1099Mutation = useMutation({
    mutationFn: async (year: number) => {
      return await apiRequest('/api/admin/generate-1099-forms', {
        method: 'POST',
        body: JSON.stringify({ year }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tax-reports'] });
      toast({
        title: "Success",
        description: "1099 forms generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate 1099 forms",
        variant: "destructive",
      });
    },
  });

  const totalDrivers = taxReports?.length || 0;
  const totalEarnings = taxReports?.reduce((sum, r) => sum + r.totalEarnings, 0) || 0;
  const formsGenerated = taxReports?.filter(r => r.form1099Generated).length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">1099 Tax Forms</h1>
        <p className="text-muted-foreground">Generate and manage driver tax documents</p>
      </div>

      <div className="flex items-center justify-between">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]" data-testid="select-tax-year">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => generate1099Mutation.mutate(parseInt(selectedYear))}
          disabled={generate1099Mutation.isPending}
          data-testid="button-generate-1099"
        >
          <FileText className="h-4 w-4 mr-2" />
          {generate1099Mutation.isPending ? "Generating..." : "Generate 1099 Forms"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold" data-testid="stat-total-drivers">
                  {isLoading ? "..." : totalDrivers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold" data-testid="stat-total-earnings">
                  {isLoading ? "..." : formatCurrency(totalEarnings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forms Generated</p>
                <p className="text-2xl font-bold" data-testid="stat-forms-generated">
                  {isLoading ? "..." : formsGenerated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Driver Tax Reports - {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tax reports...</p>
            </div>
          ) : !taxReports || taxReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tax reports found for {selectedYear}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>1099 Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxReports.map((report) => (
                    <TableRow key={report.driverId} data-testid={`tax-report-row-${report.driverId}`}>
                      <TableCell className="font-mono">#{report.driverId}</TableCell>
                      <TableCell className="font-medium">{report.driverName}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(report.totalEarnings)}</TableCell>
                      <TableCell>
                        <Badge className={report.form1099Generated ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {report.form1099Generated ? 'GENERATED' : 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.form1099Url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(report.form1099Url!, '_blank')}
                            data-testid={`button-download-${report.driverId}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not available</span>
                        )}
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
