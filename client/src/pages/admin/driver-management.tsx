import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, CheckCircle, XCircle, TrendingUp, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StatusBadge from "@/components/admin/StatusBadge";
import PerformanceCard from "@/components/admin/PerformanceCard";
import ReasonModal from "@/components/admin/ReasonModal";

interface Driver {
  id: number;
  email: string;
  fullName: string | null;
  status: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  completionRate: number;
  stripeIdentityVerified: boolean;
  backgroundCheckStatus: string;
  createdAt: string;
}

export default function DriverManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    action: "suspend" | "deactivate" | "reject" | "other";
    driverId: number | null;
  }>({ open: false, action: "other", driverId: null });

  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['/api/admin/drivers'],
    refetchInterval: 30000,
  });

  const updateDriverStatusMutation = useMutation({
    mutationFn: async (data: { driverId: number; status: string; reason?: string; category?: string }) => {
      return await apiRequest(`/api/admin/drivers/${data.driverId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status, reason: data.reason, category: data.category }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/drivers'] });
      toast({
        title: "Success",
        description: "Driver status updated successfully",
      });
      setActionModal({ open: false, action: "other", driverId: null });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive",
      });
    },
  });

  // Calculate stats
  const totalDrivers = drivers?.length || 0;
  const activeDrivers = drivers?.filter(d => d.status === 'active').length || 0;
  const averageRating = drivers?.length 
    ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(2)
    : "0.00";
  const verifiedDrivers = drivers?.filter(d => d.stripeIdentityVerified).length || 0;

  // Filter drivers
  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = !searchQuery || 
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusAction = (driverId: number, action: "suspend" | "deactivate") => {
    setActionModal({ open: true, action, driverId });
  };

  const handleConfirmAction = (reason: string, category?: string) => {
    if (!actionModal.driverId) return;
    
    const statusMap: Record<string, string> = {
      suspend: "suspended",
      deactivate: "deactivated",
    };

    updateDriverStatusMutation.mutate({
      driverId: actionModal.driverId,
      status: statusMap[actionModal.action] || "inactive",
      reason,
      category,
    });
  };

  const handleActivate = (driverId: number) => {
    updateDriverStatusMutation.mutate({
      driverId,
      status: "active",
      reason: "Reactivated by admin",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Driver Management</h1>
        <p className="text-muted-foreground">Manage driver accounts, performance, and verification status</p>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PerformanceCard
          title="Total Drivers"
          value={totalDrivers}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          testId="stat-total-drivers"
        />
        <PerformanceCard
          title="Active Drivers"
          value={activeDrivers}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          testId="stat-active-drivers"
        />
        <PerformanceCard
          title="Average Rating"
          value={averageRating}
          icon={Star}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          testId="stat-avg-rating"
        />
        <PerformanceCard
          title="Verified"
          value={verifiedDrivers}
          icon={AlertTriangle}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          testId="stat-verified-drivers"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-drivers"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Driver Accounts ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No drivers found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Background Check</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id} data-testid={`driver-row-${driver.id}`}>
                      <TableCell className="font-mono text-sm">#{driver.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver.fullName || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{driver.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={driver.status} variant="driver" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{driver.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{driver.completedJobs}</span>
                        <span className="text-muted-foreground">/{driver.totalJobs}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${driver.completionRate >= 90 ? 'text-green-600' : driver.completionRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {driver.completionRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {driver.stripeIdentityVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={driver.backgroundCheckStatus} variant="verification" />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(driver.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {driver.status === "active" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusAction(driver.id, "suspend")}
                                data-testid={`button-suspend-${driver.id}`}
                              >
                                Suspend
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusAction(driver.id, "deactivate")}
                                data-testid={`button-deactivate-${driver.id}`}
                              >
                                Deactivate
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleActivate(driver.id)}
                              data-testid={`button-activate-${driver.id}`}
                            >
                              Activate
                            </Button>
                          )}
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

      {/* Action Modal */}
      <ReasonModal
        open={actionModal.open}
        onOpenChange={(open) => setActionModal({ ...actionModal, open })}
        title={actionModal.action === "suspend" ? "Suspend Driver" : "Deactivate Driver"}
        description={`Please provide a reason for ${actionModal.action}ing this driver account.`}
        action={actionModal.action}
        onConfirm={handleConfirmAction}
        isLoading={updateDriverStatusMutation.isPending}
      />
    </div>
  );
}
