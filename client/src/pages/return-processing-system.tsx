import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Package, 
  Scan,
  Store,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Settings,
  Building2,
  Barcode,
  Printer,
  Upload,
  Database,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ReturnRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  retailer: string;
  itemDescription: string;
  originalPrice: number;
  reason: string;
  hasReceipt: boolean;
  hasOriginalTags: boolean;
  purchaseDate: string;
  purchaseType: 'online' | 'in-store';
  returnBarcode: string;
  retailerBarcode?: string;
  status: 'pending' | 'generated' | 'processed' | 'completed';
  createdAt: string;
}

interface Retailer {
  id: string;
  name: string;
  logo: string;
  supportedFormats: string[];
  processingMethod: 'barcode' | 'manual' | 'hybrid';
  integrationStatus: 'active' | 'pending' | 'inactive';
  returnPolicy: string;
}

export default function ReturnProcessingSystem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [returnRequest, setReturnRequest] = useState<Partial<ReturnRequest>>({});
  const [generatedBarcode, setGeneratedBarcode] = useState<string>('');
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);

  // Mock retailer data - in production, this would come from API
  const retailers: Retailer[] = [
    {
      id: 'target',
      name: 'Target',
      logo: '/api/placeholder/logo/target',
      supportedFormats: ['Code128', 'QR', 'PDF417'],
      processingMethod: 'hybrid',
      integrationStatus: 'active',
      returnPolicy: '90-day return policy with receipt'
    },
    {
      id: 'walmart',
      name: 'Walmart',
      logo: '/api/placeholder/logo/walmart',
      supportedFormats: ['UPC', 'Code128'],
      processingMethod: 'barcode',
      integrationStatus: 'active',
      returnPolicy: '90-day return policy, receipts recommended'
    },
    {
      id: 'bestbuy',
      name: 'Best Buy',
      logo: '/api/placeholder/logo/bestbuy',
      supportedFormats: ['Code128', 'QR'],
      processingMethod: 'hybrid',
      integrationStatus: 'pending',
      returnPolicy: '15-30 day return window varies by item'
    },
    {
      id: 'kohls',
      name: "Kohl's",
      logo: '/api/placeholder/logo/kohls',
      supportedFormats: ['Code128', 'QR', 'PDF417'],
      processingMethod: 'manual',
      integrationStatus: 'active',
      returnPolicy: 'Liberal return policy, accepts returns from other retailers'
    }
  ];

  // Generate return processing barcode mutation
  const generateBarcodeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/return-processing/generate-barcode', 'POST', data);
    },
    onSuccess: (response) => {
      setGeneratedBarcode(response.barcode);
      setShowBarcodePreview(true);
      toast({
        title: "Return Barcode Generated",
        description: "Your universal return processing barcode is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateBarcode = () => {
    const data = {
      ...returnRequest,
      retailerId: selectedRetailer,
      timestamp: new Date().toISOString()
    };
    
    generateBarcodeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <QrCode className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Universal Return Processing System
          </h1>
          <p className="text-xl text-amber-700 max-w-3xl mx-auto">
            Generate standardized return barcodes that work with any retailer's system. 
            One barcode, universal acceptance, seamless processing.
          </p>
        </div>

        <Tabs defaultValue="generator" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generator">Barcode Generator</TabsTrigger>
            <TabsTrigger value="retailers">Supported Retailers</TabsTrigger>
            <TabsTrigger value="integration">API Integration</TabsTrigger>
            <TabsTrigger value="dashboard">Processing Dashboard</TabsTrigger>
          </TabsList>

          {/* Barcode Generator */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Return Information Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Return Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input 
                        id="customerName"
                        value={returnRequest.customerName || ''}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input 
                        id="customerEmail"
                        type="email"
                        value={returnRequest.customerEmail || ''}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, customerEmail: e.target.value }))}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="retailer">Select Retailer</Label>
                    <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose retailer" />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers.map(retailer => (
                          <SelectItem key={retailer.id} value={retailer.id}>
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4" />
                              {retailer.name}
                              <Badge 
                                variant={retailer.integrationStatus === 'active' ? 'default' : 'secondary'}
                                className="ml-2"
                              >
                                {retailer.integrationStatus}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="itemDescription">Item Description</Label>
                    <Textarea 
                      id="itemDescription"
                      value={returnRequest.itemDescription || ''}
                      onChange={(e) => setReturnRequest(prev => ({ ...prev, itemDescription: e.target.value }))}
                      placeholder="Red Nike Air Max shoes, size 10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input 
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={returnRequest.originalPrice || ''}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                        placeholder="89.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input 
                        id="purchaseDate"
                        type="date"
                        value={returnRequest.purchaseDate || ''}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Return Reason</Label>
                    <Select 
                      value={returnRequest.reason || ''}
                      onValueChange={(value) => setReturnRequest(prev => ({ ...prev, reason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defective">Defective/Damaged</SelectItem>
                        <SelectItem value="wrong-size">Wrong Size</SelectItem>
                        <SelectItem value="wrong-item">Wrong Item Received</SelectItem>
                        <SelectItem value="not-as-described">Not As Described</SelectItem>
                        <SelectItem value="changed-mind">Changed Mind</SelectItem>
                        <SelectItem value="better-price">Found Better Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={returnRequest.hasReceipt || false}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, hasReceipt: e.target.checked }))}
                      />
                      <span className="text-sm">Has Original Receipt</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={returnRequest.hasOriginalTags || false}
                        onChange={(e) => setReturnRequest(prev => ({ ...prev, hasOriginalTags: e.target.checked }))}
                      />
                      <span className="text-sm">Has Original Tags</span>
                    </label>
                  </div>

                  <Button 
                    onClick={handleGenerateBarcode}
                    disabled={!selectedRetailer || !returnRequest.customerName || !returnRequest.itemDescription}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    size="lg"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Universal Return Barcode
                  </Button>
                </CardContent>
              </Card>

              {/* Barcode Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Barcode className="h-5 w-5" />
                    Generated Barcode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showBarcodePreview ? (
                    <div className="space-y-4">
                      {/* Barcode Display */}
                      <div className="bg-white p-6 rounded-lg border-2 border-amber-200 text-center">
                        <div className="mb-4">
                          <div className="text-4xl font-mono tracking-widest border-4 border-black inline-block px-4 py-2">
                            {generatedBarcode || 'RIT2025010100001'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Universal Return Processing Code
                        </div>
                        <div className="text-sm font-medium text-amber-700 mt-2">
                          {selectedRetailer ? retailers.find(r => r.id === selectedRetailer)?.name : 'Selected Retailer'}
                        </div>
                      </div>

                      {/* Processing Instructions */}
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-medium text-amber-900 mb-2">Processing Instructions:</h4>
                        <ol className="text-sm text-amber-800 space-y-1">
                          <li>1. Print this barcode and attach to item packaging</li>
                          <li>2. Present at any participating retailer location</li>
                          <li>3. Store associate scans code for instant return processing</li>
                          <li>4. Return is processed according to retailer's policy</li>
                        </ol>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button variant="outline">
                          <Printer className="h-4 w-4 mr-2" />
                          Print Barcode
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Fill out the return information to generate your barcode</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Supported Retailers */}
          <TabsContent value="retailers">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {retailers.map(retailer => (
                <Card key={retailer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {retailer.name}
                      </CardTitle>
                      <Badge 
                        variant={retailer.integrationStatus === 'active' ? 'default' : 
                                retailer.integrationStatus === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {retailer.integrationStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Processing Method</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Zap className="h-4 w-4" />
                        <span className="capitalize">{retailer.processingMethod}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Supported Formats</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {retailer.supportedFormats.map(format => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600">Return Policy</Label>
                      <p className="text-sm text-gray-800 mt-1">{retailer.returnPolicy}</p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={retailer.integrationStatus !== 'active'}
                    >
                      {retailer.integrationStatus === 'active' ? 'Test Integration' : 'Coming Soon'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Integration */}
          <TabsContent value="integration">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    API Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="mb-2 text-gray-300">// Generate return barcode</div>
                    <div>POST /api/return-processing/generate-barcode</div>
                    <br />
                    <div className="text-yellow-300">&#123;</div>
                    <div className="ml-4">
                      <div>"customerName": "John Smith",</div>
                      <div>"customerEmail": "john@example.com",</div>
                      <div>"retailerId": "target",</div>
                      <div>"itemDescription": "Red Nike shoes",</div>
                      <div>"originalPrice": 89.99,</div>
                      <div>"hasReceipt": true</div>
                    </div>
                    <div className="text-yellow-300">&#125;</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Response Fields:</h4>
                    <ul className="text-sm space-y-1">
                      <li><code>barcode</code> - Universal return processing code</li>
                      <li><code>qrCode</code> - QR code data URL</li>
                      <li><code>retailerSpecificCode</code> - Store-specific identifier</li>
                      <li><code>processingInstructions</code> - Return handling steps</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Integration Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">API Authentication</div>
                        <div className="text-sm text-gray-600">Bearer token required</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Webhook Configuration</div>
                        <div className="text-sm text-gray-600">Real-time status updates</div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Retailer Onboarding</div>
                        <div className="text-sm text-gray-600">Custom integration per store</div>
                      </div>
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>

                  <Button className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Download SDK
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Processing Dashboard */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Returns</p>
                        <p className="text-2xl font-bold">1,247</p>
                      </div>
                      <Package className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Successfully Processed</p>
                        <p className="text-2xl font-bold">1,189</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Retailers</p>
                        <p className="text-2xl font-bold">47</p>
                      </div>
                      <Store className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Processing Rate</p>
                        <p className="text-2xl font-bold">95.3%</p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Processing Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Processing Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 'RIT2025010100001', customer: 'Sarah Johnson', retailer: 'Target', item: 'Winter Jacket', status: 'completed', time: '2 min ago' },
                      { id: 'RIT2025010100002', customer: 'Mike Chen', retailer: 'Walmart', item: 'Bluetooth Headphones', status: 'processing', time: '5 min ago' },
                      { id: 'RIT2025010100003', customer: 'Emily Davis', retailer: 'Best Buy', item: 'Gaming Mouse', status: 'completed', time: '8 min ago' },
                      { id: 'RIT2025010100004', customer: 'James Wilson', retailer: "Kohl's", item: 'Running Shoes', status: 'pending', time: '12 min ago' }
                    ].map((return_item, index) => (
                      <div key={return_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {return_item.id}
                          </div>
                          <div>
                            <div className="font-medium">{return_item.customer}</div>
                            <div className="text-sm text-gray-600">{return_item.item} → {return_item.retailer}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={return_item.status === 'completed' ? 'default' : 
                                   return_item.status === 'processing' ? 'secondary' : 'outline'}
                          >
                            {return_item.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{return_item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}