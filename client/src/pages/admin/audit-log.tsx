import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, User, Activity, AlertCircle, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import PerformanceCard from "@/components/admin/PerformanceCard";

interface AuditLogEntry {
  id: number;
  timestamp: string;
  userId: number | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  const { data: auditLogs, isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['/api/admin/audit-log', { days: dateRange }],
    refetchInterval: 30000,
  });

  // Calculate stats
  const totalEvents = auditLogs?.length || 0;
  const authEvents = auditLogs?.filter(log => 
    log.action.includes('login') || log.action.includes('logout') || log.action.includes('register')
  ).length || 0;
  const adminActions = auditLogs?.filter(log => 
    log.action.includes('admin') || log.action.includes('delete') || log.action.includes('update')
  ).length || 0;
  const failedAttempts = auditLogs?.filter(log => 
    log.action.includes('failed')
  ).length || 0;

  // Filter logs
  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = !searchQuery || 
      log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    
    return matchesSearch && matchesAction;
  }) || [];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    let className = "bg-blue-100 text-blue-700";
    
    if (actionLower.includes('create')) className = "bg-green-100 text-green-700";
    else if (actionLower.includes('delete') || actionLower.includes('deactivate')) className = "bg-red-100 text-red-700";
    else if (actionLower.includes('update') || actionLower.includes('edit')) className = "bg-yellow-100 text-yellow-700";
    else if (actionLower.includes('login')) className = "bg-purple-100 text-purple-700";
    else if (actionLower.includes('failed')) className = "bg-red-100 text-red-700";
    
    return <Badge className={className}>{action}</Badge>;
  };

  const handleExport = () => {
    // In production, this would export the audit log to CSV
    const csvContent = filteredLogs.map(log => 
      `"${log.timestamp}","${log.userEmail || 'System'}","${log.action}","${log.entityType}","${log.details || ''}"`
    ).join('\n');
    
    const blob = new Blob([`Timestamp,User,Action,Entity,Details\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Audit Log</h1>
        <p className="text-muted-foreground">Track all system events and administrative actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PerformanceCard
          title="Total Events"
          value={totalEvents}
          icon={Activity}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          testId="stat-total-events"
        />
        <PerformanceCard
          title="Auth Events"
          value={authEvents}
          icon={User}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          testId="stat-auth-events"
        />
        <PerformanceCard
          title="Admin Actions"
          value={adminActions}
          icon={FileSearch}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          testId="stat-admin-actions"
        />
        <PerformanceCard
          title="Failed Attempts"
          value={failedAttempts}
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          testId="stat-failed-attempts"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-audit"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-action-filter">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login/Auth</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-date-range">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" data-testid="button-export-audit">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Event Log ({filteredLogs.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading audit log...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No audit log entries found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`audit-row-${log.id}`}>
                      <TableCell className="font-mono text-xs">
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        {log.userEmail ? (
                          <div>
                            <p className="font-medium text-sm">{log.userEmail}</p>
                            <p className="text-xs text-muted-foreground">ID: {log.userId}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.entityType}</p>
                          {log.entityId && (
                            <p className="text-xs text-muted-foreground font-mono">#{log.entityId}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate" title={log.details || ''}>
                          {log.details || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Notice */}
      <Card className="border-[#B8956A]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Audit Log Retention Policy</h4>
              <p className="text-sm text-muted-foreground">
                Audit logs are retained for 3 years minimum for security and compliance purposes. 
                Critical events are archived indefinitely. All timestamps are in UTC.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
