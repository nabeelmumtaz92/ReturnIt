import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Mail, Calendar, Car, MapPin, Phone, FileCheck, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DriverApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  } | null;
  applicationStatus: string;
  backgroundCheckStatus: string;
  onboardingStep: string;
  createdAt: string;
}

export default function DriverApplications() {
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    driver: DriverApplication | null;
  }>({ open: false, action: null, driver: null });

  // Fetch driver applications
  const { data: applications, isLoading, isError } = useQuery<DriverApplication[]>({
    queryKey: ['/api/admin/driver-applications/pending'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Approve driver mutation
  const approveMutation = useMutation({
    mutationFn: async (driverId: number) => {
      return apiRequest('POST', `/api/admin/driver-applications/${driverId}/approve`, {
        approvalNotes: 'Manually approved by admin',
        adminId: 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: "Driver Activated",
        description: "Driver has been approved and can now use the driver app.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/driver-applications/pending'] });
      setActionDialog({ open: false, action: null, driver: null });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve driver application.",
        variant: "destructive",
      });
    }
  });

  // Reject driver mutation
  const rejectMutation = useMutation({
    mutationFn: async (driverId: number) => {
      return apiRequest('POST', `/api/admin/driver-applications/${driverId}/reject`, {
        rejectionReason: 'Application rejected by admin',
        rejectionNotes: 'Manually rejected',
        adminId: 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: "Driver Rejected",
        description: "Driver application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/driver-applications/pending'] });
      setActionDialog({ open: false, action: null, driver: null });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject driver application.",
        variant: "destructive",
      });
    }
  });

  // Calculate stats
  const totalApplications = applications?.length || 0;
  const pendingApplications = applications?.filter(a => 
    a.applicationStatus === 'pending_review' || 
    a.backgroundCheckStatus === 'pending'
  ).length || 0;
  const approvedApplications = applications?.filter(a => 
    a.backgroundCheckStatus === 'passed' || 
    a.applicationStatus === 'approved'
  ).length || 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('pending') || statusLower === 'in_progress') {
      return { variant: 'secondary' as const, label: 'Pending', className: 'bg-yellow-100 text-yellow-700' };
    }
    if (statusLower.includes('approved') || statusLower === 'passed') {
      return { variant: 'default' as const, label: 'Approved', className: 'bg-green-100 text-green-700' };
    }
    if (statusLower.includes('rejected') || statusLower === 'failed') {
      return { variant: 'destructive' as const, label: 'Rejected', className: 'bg-red-100 text-red-700' };
    }
    return { variant: 'secondary' as const, label: status || 'Unknown', className: '' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Driver Applications</h1>
        <p className="text-muted-foreground">Review and manage driver onboarding applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-applications">
                  {isLoading ? "..." : totalApplications}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FileCheck className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-applications">
                  {isLoading ? "..." : pendingApplications}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-approved-applications">
                  {isLoading ? "..." : approvedApplications}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Driver Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8" data-testid="loading-applications">
              <div className="text-center">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8" data-testid="error-applications">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 font-medium mb-2">Failed to load driver applications</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
              </div>
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <UserCheck className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                No driver applications found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Applications will appear here when drivers sign up
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Application Status</TableHead>
                    <TableHead>Background Check</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const appStatus = getStatusBadge(app.applicationStatus);
                    const bgStatus = getStatusBadge(app.backgroundCheckStatus);
                    
                    return (
                      <TableRow key={app.id} data-testid={`application-row-${app.id}`}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium">
                              {app.firstName} {app.lastName}
                            </p>
                            {app.vehicleInfo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Car className="h-3 w-3 inline mr-1" />
                                {app.vehicleInfo.year} {app.vehicleInfo.make} {app.vehicleInfo.model}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{app.email}</span>
                            </div>
                            {app.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{app.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {app.city}, {app.state}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={appStatus.variant} className={appStatus.className}>
                            {appStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={bgStatus.variant} className={bgStatus.className}>
                            {bgStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(app)}
                              data-testid={`button-view-${app.id}`}
                            >
                              View Details
                            </Button>
                            {app.applicationStatus !== 'approved_active' && app.applicationStatus !== 'approved' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => setActionDialog({ open: true, action: 'approve', driver: app })}
                                data-testid={`button-approve-${app.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Make Active Now
                              </Button>
                            )}
                            {app.applicationStatus !== 'rejected' && app.applicationStatus !== 'approved_active' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActionDialog({ open: true, action: 'reject', driver: app })}
                                data-testid={`button-reject-${app.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#B8956A]" />
              Application Details
            </DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              {/* Driver Info */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Driver Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedApplication.firstName} {selectedApplication.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{formatDate(selectedApplication.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedApplication.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Address</h3>
                <div className="text-sm space-y-1">
                  <p>{selectedApplication.address}</p>
                  <p>
                    {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zipCode}
                  </p>
                </div>
              </div>

              {/* Vehicle Info */}
              {selectedApplication.vehicleInfo && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Make & Model</p>
                      <p className="font-medium">
                        {selectedApplication.vehicleInfo.year} {selectedApplication.vehicleInfo.make} {selectedApplication.vehicleInfo.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Color</p>
                      <p className="font-medium">{selectedApplication.vehicleInfo.color}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">License Plate</p>
                      <p className="font-medium font-mono">{selectedApplication.vehicleInfo.licensePlate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Application Status</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Application</p>
                    <Badge className={getStatusBadge(selectedApplication.applicationStatus).className}>
                      {getStatusBadge(selectedApplication.applicationStatus).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Background Check</p>
                    <Badge className={getStatusBadge(selectedApplication.backgroundCheckStatus).className}>
                      {getStatusBadge(selectedApplication.backgroundCheckStatus).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Onboarding Step</p>
                    <p className="font-medium capitalize">{selectedApplication.onboardingStep?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applied On</p>
                    <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setSelectedApplication(null)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-close-details"
                >
                  Close
                </Button>
                {selectedApplication.applicationStatus !== 'approved_active' && (
                  <>
                    <Button 
                      onClick={() => {
                        setActionDialog({ open: true, action: 'approve', driver: selectedApplication });
                        setSelectedApplication(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="button-approve-modal"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Make Active Now
                    </Button>
                    {selectedApplication.applicationStatus !== 'rejected' && (
                      <Button 
                        onClick={() => {
                          setActionDialog({ open: true, action: 'reject', driver: selectedApplication });
                          setSelectedApplication(null);
                        }}
                        variant="destructive"
                        className="flex-1"
                        data-testid="button-reject-modal"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null, driver: null })}>
        <DialogContent data-testid="dialog-confirm-action">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog.action === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approve Driver Application
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Driver Application
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' ? (
                <>
                  Are you sure you want to approve and activate <strong>{actionDialog.driver?.firstName} {actionDialog.driver?.lastName}</strong>?
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">This will:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                      <li>Set their application status to "Active"</li>
                      <li>Mark background check as "Passed"</li>
                      <li>Allow them to use the driver mobile app</li>
                      <li>Send them an approval email notification</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{actionDialog.driver?.firstName} {actionDialog.driver?.lastName}</strong>'s application?
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900">
                      This will notify them via email and they will not be able to use the driver app.
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, driver: null })}
              data-testid="button-cancel-action"
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (actionDialog.driver) {
                  if (actionDialog.action === 'approve') {
                    approveMutation.mutate(actionDialog.driver.id);
                  } else {
                    rejectMutation.mutate(actionDialog.driver.id);
                  }
                }
              }}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className={actionDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              data-testid="button-confirm-action"
            >
              {approveMutation.isPending || rejectMutation.isPending ? 'Processing...' : 
                actionDialog.action === 'approve' ? 'Approve & Activate' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
