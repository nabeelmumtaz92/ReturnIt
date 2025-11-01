import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Key, TrendingUp } from "lucide-react";
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

interface RetailerAccount {
  id: number;
  companyId: number;
  companyName: string;
  userId: number;
  role: string;
  subscriptionTier: string;
  apiKeyCount: number;
  totalOrders: number;
  createdAt: string;
}

export default function Retailers() {
  const { data: retailers, isLoading } = useQuery<RetailerAccount[]>({
    queryKey: ['/api/admin/retailers'],
    refetchInterval: 30000,
  });

  const totalRetailers = retailers?.length || 0;
  const totalOrders = retailers?.reduce((sum, r) => sum + (r.totalOrders || 0), 0) || 0;
  const totalApiKeys = retailers?.reduce((sum, r) => sum + (r.apiKeyCount || 0), 0) || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTierBadge = (tier: string) => {
    const tierMap: Record<string, { className: string }> = {
      free: { className: 'bg-gray-100 text-gray-700' },
      basic: { className: 'bg-blue-100 text-blue-700' },
      pro: { className: 'bg-purple-100 text-purple-700' },
      enterprise: { className: 'bg-green-100 text-green-700' },
    };
    const config = tierMap[tier.toLowerCase()] || { className: '' };
    return <Badge className={config.className}>{tier.toUpperCase()}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { className: string }> = {
      admin: { className: 'bg-red-100 text-red-700' },
      manager: { className: 'bg-orange-100 text-orange-700' },
      viewer: { className: 'bg-blue-100 text-blue-700' },
    };
    const config = roleMap[role.toLowerCase()] || { className: '' };
    return <Badge className={config.className}>{role.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Retailer Management</h1>
        <p className="text-muted-foreground">Manage enterprise retail partners and API access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Retailers</p>
                <p className="text-2xl font-bold" data-testid="stat-total-retailers">
                  {isLoading ? "..." : totalRetailers}
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
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold" data-testid="stat-total-orders">
                  {isLoading ? "..." : totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Keys</p>
                <p className="text-2xl font-bold" data-testid="stat-api-keys">
                  {isLoading ? "..." : totalApiKeys}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold" data-testid="stat-active-users">
                  {isLoading ? "..." : totalRetailers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Retailer Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading retailers...</p>
            </div>
          ) : !retailers || retailers.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No retailer accounts found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Retailer accounts will appear here once they register
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>API Keys</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retailers.map((retailer) => (
                    <TableRow key={retailer.id} data-testid={`retailer-row-${retailer.id}`}>
                      <TableCell className="font-medium">{retailer.companyName}</TableCell>
                      <TableCell className="font-mono text-sm">#{retailer.userId}</TableCell>
                      <TableCell>{getRoleBadge(retailer.role)}</TableCell>
                      <TableCell>{getTierBadge(retailer.subscriptionTier)}</TableCell>
                      <TableCell className="text-center">{retailer.apiKeyCount}</TableCell>
                      <TableCell className="text-center">{retailer.totalOrders}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(retailer.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-manage-${retailer.id}`}
                        >
                          Manage
                        </Button>
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
