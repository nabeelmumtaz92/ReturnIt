import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  MapPin,
  Package,
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';

interface BulkImport {
  id: number;
  fileName: string;
  fileSize: number;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  status: string;
  importType: string;
  errors: string[];
  createdAt: string;
  completedAt: string | null;
  importedBy: number;
  importedByName: string;
}

interface ColumnMapping {
  [key: string]: string;
}

interface ImportPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
  suggestedMapping: ColumnMapping;
}

const REQUIRED_ORDER_FIELDS = {
  'pickupStreetAddress': 'Pickup Address',
  'pickupCity': 'Pickup City',
  'pickupState': 'Pickup State',
  'pickupZipCode': 'Pickup ZIP',
  'retailer': 'Retailer',
  'itemCategory': 'Item Category',
  'itemDescription': 'Item Description',
  'itemSize': 'Item Size',
  'numberOfItems': 'Number of Items',
};

const OPTIONAL_ORDER_FIELDS = {
  'pickupInstructions': 'Pickup Instructions',
  'returnReason': 'Return Reason',
  'originalOrderNumber': 'Original Order Number',
  'scheduledPickupTime': 'Scheduled Pickup Time',
  'customerNotes': 'Customer Notes',
};

export default function BulkOrderImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('orders');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imports, isLoading } = useQuery<BulkImport[]>({
    queryKey: ['/api/bulk-imports'],
  });

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          throw new Error('File is empty');
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        // Generate suggested mapping
        const suggestedMapping: ColumnMapping = {};
        const requiredFields = importType === 'orders' ? REQUIRED_ORDER_FIELDS : {};
        
        Object.keys(requiredFields).forEach(field => {
          const matchingHeader = headers.find(header => 
            header.toLowerCase().includes(field.toLowerCase().replace(/([A-Z])/g, ' $1').trim()) ||
            header.toLowerCase().includes(requiredFields[field as keyof typeof requiredFields].toLowerCase())
          );
          if (matchingHeader) {
            suggestedMapping[field] = matchingHeader;
          }
        });

        setImportPreview({
          headers,
          rows: rows.slice(0, 10), // Show first 10 rows for preview
          totalRows: rows.length,
          suggestedMapping,
        });
        
        setColumnMapping(suggestedMapping);
      } catch (error) {
        toast({
          title: "File Processing Error",
          description: "Unable to process the file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV, XLS, or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    processFile(file);
  };

  const performImport = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !importPreview) throw new Error('No file selected');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('importType', importType);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      
      const response = await fetch('/api/bulk-imports', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Import Started",
        description: "Your bulk import has been started. You can monitor progress below.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-imports'] });
      setSelectedFile(null);
      setImportPreview(null);
      setColumnMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    const headers = Object.values(importType === 'orders' ? REQUIRED_ORDER_FIELDS : {});
    const optionalHeaders = Object.values(importType === 'orders' ? OPTIONAL_ORDER_FIELDS : {});
    const allHeaders = [...headers, ...optionalHeaders];
    
    const worksheet = XLSX.utils.aoa_to_sheet([allHeaders]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `${importType}_template.xlsx`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'processing': 'bg-blue-500 text-white',
      'completed': 'bg-green-500 text-white',
      'failed': 'bg-red-500 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const canProceedWithImport = () => {
    if (!importPreview || !selectedFile) return false;
    
    const requiredFields = Object.keys(importType === 'orders' ? REQUIRED_ORDER_FIELDS : {});
    return requiredFields.every(field => columnMapping[field]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-8">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading bulk import dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk Order Import</h1>
          <p className="text-gray-600 mt-1">Import orders, customers, and drivers from spreadsheets</p>
        </div>
        <Button onClick={downloadTemplate} variant="outline" data-testid="button-download-template">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" data-testid="tab-import">New Import</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Import History</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Import Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-type">Import Type</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger data-testid="select-import-type">
                      <SelectValue placeholder="Select import type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="drivers">Drivers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-green-500" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setImportPreview(null);
                            setColumnMapping({});
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          data-testid="button-remove-file"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-gray-600">
                          Drop your CSV or Excel file here, or click to browse
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          className="hidden"
                          data-testid="input-file-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-browse-file"
                        >
                          Browse File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {importPreview && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">File Preview</h3>
                      <Badge variant="secondary">
                        {importPreview.totalRows} rows detected
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Column Mapping</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(REQUIRED_ORDER_FIELDS).map(([field, label]) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Label className="w-32 text-sm">{label}*</Label>
                            <Select
                              value={columnMapping[field] || ''}
                              onValueChange={(value) => 
                                setColumnMapping(prev => ({ ...prev, [field]: value }))
                              }
                            >
                              <SelectTrigger className="flex-1" data-testid={`select-mapping-${field}`}>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- No mapping --</SelectItem>
                                {importPreview.headers.map(header => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => performImport.mutate()}
                      disabled={!canProceedWithImport() || performImport.isPending}
                      className="w-full"
                      data-testid="button-start-import"
                    >
                      {performImport.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Starting Import...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Start Import
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {importPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {importPreview.headers.map((header, index) => (
                            <th key={index} className="text-left p-2 font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2 max-w-32 truncate">
                                {cell || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importPreview.totalRows > 5 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing first 5 rows of {importPreview.totalRows} total
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Imported By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imports?.map((importRecord) => (
                      <TableRow key={importRecord.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{importRecord.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {importRecord.importType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(importRecord.status)}
                            <Badge className={getStatusColor(importRecord.status)}>
                              {importRecord.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{importRecord.totalRows} total</div>
                            <div className="text-gray-600">
                              {importRecord.successfulImports} success, {importRecord.failedImports} failed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {importRecord.totalRows > 0 
                                ? Math.round((importRecord.successfulImports / importRecord.totalRows) * 100)
                                : 0}%
                            </div>
                            <Progress 
                              value={importRecord.totalRows > 0 
                                ? (importRecord.successfulImports / importRecord.totalRows) * 100
                                : 0} 
                              className="h-2" 
                            />
                          </div>
                        </TableCell>
                        <TableCell>{importRecord.importedByName}</TableCell>
                        <TableCell>
                          <time className="text-sm">
                            {new Date(importRecord.createdAt).toLocaleDateString()}
                          </time>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-view-import-${importRecord.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {importRecord.errors.length > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-view-errors-${importRecord.id}`}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{imports?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Imports</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">
                  {imports?.reduce((acc, imp) => acc + imp.successfulImports, 0) || 0}
                </p>
                <p className="text-sm text-gray-600">Records Imported</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">
                  {imports?.reduce((acc, imp) => acc + imp.failedImports, 0) || 0}
                </p>
                <p className="text-sm text-gray-600">Failed Records</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">
                  {imports?.length ? 
                    Math.round((imports.reduce((acc, imp) => acc + imp.successfulImports, 0) / 
                    imports.reduce((acc, imp) => acc + imp.totalRows, 0)) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}