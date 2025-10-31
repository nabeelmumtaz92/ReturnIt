import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Calendar, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
}

export default function Customers() {
  // Fetch customers data
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter(c => c.isActive).length || 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customers</h1>
        <p className="text-muted-foreground">View and manage all registered customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-customers">
                  {isLoading ? "..." : totalCustomers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-customers">
                  {isLoading ? "..." : activeCustomers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading customers...</p>
              </div>
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                No customers found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Customers will appear here once they register
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                      <TableCell className="font-medium">
                        {customer.firstName && customer.lastName
                          ? `${customer.firstName} ${customer.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.phone || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(customer.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.isActive ? "default" : "secondary"}
                          className={customer.isActive 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : ""}
                        >
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
