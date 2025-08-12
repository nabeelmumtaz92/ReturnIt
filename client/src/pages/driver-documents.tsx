import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Car,
  Shield,
  FileCheck,
  Eye,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';

const DRIVER_HANDBOOK = `RETURNLY DRIVER HANDBOOK

1. Welcome to Returnly
Thank you for joining Returnly! You are a vital part of our mission to make returns easier for customers.

2. Getting Started
- Download the Returnly Driver app
- Log in with your contractor credentials
- Accept or decline orders as they appear

3. Pickup & Delivery
- Verify package details before pickup
- Follow GPS navigation in-app
- Obtain proof of drop-off (photo + store receipt when required)

4. Earnings & Payments
- Earnings are calculated per completed order
- See the pay schedule in-app for base pay, distance pay, and bonuses
- Payments are made weekly (or instant pay where available)

5. Vehicle Requirements
- Valid driver's license
- Current registration & insurance
- Safe, operable vehicle

6. Support
- In-app chat and phone support available`;

const CONTRACTOR_AGREEMENT = `RETURNLY INDEPENDENT CONTRACTOR AGREEMENT (1099)

This Independent Contractor Agreement ("Agreement") is made between Returnly ("Company") and the undersigned contractor ("Contractor").

1. INDEPENDENT CONTRACTOR STATUS
Contractor acknowledges they are an independent contractor and not an employee, agent, or representative of Returnly. Contractor is solely responsible for all taxes, insurance, and benefits.

2. SERVICES PROVIDED
Contractor agrees to perform package return and delivery services via the Returnly platform. Contractor determines their own routes, work hours, and manner of completing tasks.

3. VEHICLE & INSURANCE REQUIREMENTS
- Valid driver's license in state of operation.
- Current vehicle registration for all vehicles used.
- Minimum state-mandated liability insurance; recommended comprehensive & collision.
- Vehicle must be safe, operable, and pass state inspection (where applicable).
- Proof of registration and insurance must be on file and updated prior to expiration.
- Any lapse in registration or insurance must be reported immediately; failure to do so may result in suspension.

4. PAYMENT TERMS
Contractor will be paid per completed order according to the current pay schedule in the Returnly platform. Contractor is responsible for tracking earnings for tax purposes.

5. EQUIPMENT & EXPENSES
Contractor will supply their own vehicle, smartphone, and other equipment necessary to perform services. Contractor is responsible for fuel, maintenance, tolls, and other operating expenses.

6. COMPLIANCE
Contractor must comply with all local, state, and federal laws, including traffic regulations.

7. TERMINATION
This Agreement may be terminated by either party with written notice.

Signed: _____________________    Date: ____________`;

const W9_INSTRUCTIONS = `IRS FORM W-9 INSTRUCTIONS FOR RETURNLY CONTRACTORS

As a 1099 independent contractor, you must submit a completed IRS Form W-9 to Returnly before receiving your first payment.

Steps:
1. Fill in your legal name as shown on your tax return.
2. If you have a business name, include it, otherwise leave blank.
3. Select your federal tax classification (most individuals select "Individual/sole proprietor").
4. Enter your address.
5. Provide your Social Security Number (SSN) or Employer Identification Number (EIN).
6. Sign and date the form.

Return the completed W-9 securely to Returnly's onboarding team.`;

interface Document {
  id: string;
  title: string;
  type: 'handbook' | 'contract' | 'tax' | 'insurance' | 'license';
  status: 'required' | 'submitted' | 'approved' | 'rejected';
  description: string;
  content?: string;
  dueDate?: string;
  submittedDate?: string;
  icon: any;
}

export default function DriverDocuments() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('required');

  const documents: Document[] = [
    {
      id: 'handbook',
      title: 'Driver Handbook',
      type: 'handbook',
      status: 'approved',
      description: 'Complete guide for Returnly drivers covering procedures, earnings, and requirements',
      content: DRIVER_HANDBOOK,
      icon: FileText
    },
    {
      id: 'agreement',
      title: 'Independent Contractor Agreement',
      type: 'contract',
      status: 'required',
      description: '1099 contractor agreement outlining terms, vehicle requirements, and responsibilities',
      content: CONTRACTOR_AGREEMENT,
      dueDate: '2024-01-20',
      icon: FileCheck
    },
    {
      id: 'w9',
      title: 'IRS Form W-9',
      type: 'tax',
      status: 'submitted',
      description: 'Tax information form required for 1099 contractor payments',
      content: W9_INSTRUCTIONS,
      submittedDate: '2024-01-15',
      icon: Shield
    },
    {
      id: 'license',
      title: 'Driver\'s License',
      type: 'license',
      status: 'required',
      description: 'Valid state-issued driver\'s license verification',
      dueDate: '2024-01-18',
      icon: User
    },
    {
      id: 'registration',
      title: 'Vehicle Registration',
      type: 'insurance',
      status: 'required',
      description: 'Current vehicle registration for all vehicles used for deliveries',
      dueDate: '2024-01-18',
      icon: Car
    },
    {
      id: 'insurance',
      title: 'Vehicle Insurance',
      type: 'insurance',
      status: 'submitted',
      description: 'Current liability insurance (comprehensive & collision recommended)',
      submittedDate: '2024-01-14',
      icon: Shield
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      required: { bg: 'bg-red-100 text-red-800', icon: AlertCircle },
      submitted: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };
    const variant = variants[status as keyof typeof variants] || variants.required;
    const IconComponent = variant.icon;
    
    return (
      <Badge className={`${variant.bg} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    if (activeTab === 'required') return doc.status === 'required';
    if (activeTab === 'submitted') return doc.status === 'submitted';
    if (activeTab === 'completed') return doc.status === 'approved';
    return true;
  });

  const handleDocumentView = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleUpload = (docId: string) => {
    // In a real app, this would open a file upload dialog
    console.log('Upload document:', docId);
  };

  const downloadDocument = (doc: Document) => {
    if (!doc.content) return;
    
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedDocument(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-amber-900 flex items-center gap-3">
                    <selectedDocument.icon className="h-6 w-6" />
                    {selectedDocument.title}
                  </CardTitle>
                  <p className="text-amber-700 mt-2">{selectedDocument.description}</p>
                </div>
                {getStatusBadge(selectedDocument.status)}
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => downloadDocument(selectedDocument)}
                  disabled={!selectedDocument.content}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {selectedDocument.status === 'required' && (
                  <Button 
                    size="sm"
                    onClick={() => handleUpload(selectedDocument.id)}
                    className="bg-amber-700 hover:bg-amber-800"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Signed Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedDocument.content ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {selectedDocument.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-amber-600">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                  <p className="text-lg font-medium">Document Preview Not Available</p>
                  <p className="text-sm">Please upload this document to proceed with onboarding</p>
                </div>
              )}
              
              {(selectedDocument.dueDate || selectedDocument.submittedDate) && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between text-sm">
                    {selectedDocument.dueDate && (
                      <p className="text-amber-800">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Due Date: {selectedDocument.dueDate}
                      </p>
                    )}
                    {selectedDocument.submittedDate && (
                      <p className="text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Submitted: {selectedDocument.submittedDate}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-stone-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/driver-portal">
                <img 
                  src="/logo-cardboard-deep.png" 
                  alt="Returnly Logo" 
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-amber-900">Driver Documents</h1>
                <p className="text-amber-700 text-sm">Onboarding & Compliance Center</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href="/driver-portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Document Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Required</p>
                  <p className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.status === 'required').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Submitted</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === 'submitted').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {documents.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border-amber-200">
            <TabsTrigger value="required" className="data-[state=active]:bg-amber-100">
              Required ({documents.filter(d => d.status === 'required').length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-amber-100">
              Under Review ({documents.filter(d => d.status === 'submitted').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-amber-100">
              Completed ({documents.filter(d => d.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-100">
              All Documents ({documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <Card 
                    key={doc.id} 
                    className="bg-white/90 backdrop-blur-sm border-amber-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDocumentView(doc)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-amber-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 text-lg mb-1">
                              {doc.title}
                            </h3>
                            <p className="text-amber-700 text-sm mb-3">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-amber-600">
                              {doc.dueDate && (
                                <span>
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  Due: {doc.dueDate}
                                </span>
                              )}
                              {doc.submittedDate && (
                                <span>
                                  <CheckCircle className="h-3 w-3 inline mr-1" />
                                  Submitted: {doc.submittedDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(doc.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentView(doc);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12 text-amber-600">
                <FileText className="h-16 w-16 mx-auto mb-4 text-amber-400" />
                <p className="text-xl font-medium">No documents found</p>
                <p className="text-sm">No documents match the current filter</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}