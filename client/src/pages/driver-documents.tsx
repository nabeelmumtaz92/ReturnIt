import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Eye,
  Signature,
  Camera,
  Shield,
  User,
  Car,
  CreditCard,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  AlertCircle
} from 'lucide-react';
import { ObjectUploader } from '@/components/ObjectUploader';
import { useAuth } from "@/hooks/useAuth-simple";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DriverDocument {
  id: string;
  title: string;
  description: string;
  category: 'identity' | 'vehicle' | 'insurance' | 'background' | 'legal' | 'tax';
  required: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  uploadedAt?: string;
  approvedAt?: string;
  fileUrl?: string;
  notes?: string;
  expiresAt?: string;
}

export default function DriverDocuments() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Required driver documents
  const requiredDocuments: DriverDocument[] = [
    // Identity Documents
    {
      id: 'drivers-license',
      title: "Driver's License",
      description: "Valid driver's license (front and back)",
      category: 'identity',
      required: true,
      status: 'pending'
    },
    {
      id: 'social-security',
      title: 'Social Security Card',
      description: 'Social Security card or W-9 form',
      category: 'identity', 
      required: true,
      status: 'pending'
    },
    {
      id: 'background-check-consent',
      title: 'Background Check Consent',
      description: 'Authorization for background check processing',
      category: 'background',
      required: true,
      status: 'pending'
    },

    // Vehicle Documents
    {
      id: 'vehicle-registration',
      title: 'Vehicle Registration',
      description: 'Current vehicle registration document',
      category: 'vehicle',
      required: true,
      status: 'pending'
    },
    {
      id: 'vehicle-inspection',
      title: 'Vehicle Inspection',
      description: 'Recent vehicle inspection certificate',
      category: 'vehicle',
      required: true,
      status: 'pending',
      expiresAt: '2025-03-15'
    },
    {
      id: 'vehicle-photos',
      title: 'Vehicle Photos',
      description: 'Photos of vehicle exterior, interior, and license plate',
      category: 'vehicle',
      required: true,
      status: 'pending'
    },

    // Insurance Documents
    {
      id: 'auto-insurance',
      title: 'Auto Insurance',
      description: 'Proof of current auto insurance coverage',
      category: 'insurance',
      required: true,
      status: 'pending',
      expiresAt: '2024-12-31'
    },
    {
      id: 'liability-insurance',
      title: 'Commercial Liability Insurance',
      description: 'Commercial liability insurance for delivery services',
      category: 'insurance',
      required: false,
      status: 'pending'
    },

    // Legal Documents
    {
      id: 'independent-contractor-agreement',
      title: 'Independent Contractor Agreement',
      description: 'Legal agreement defining contractor relationship',
      category: 'legal',
      required: true,
      status: 'pending'
    },
    {
      id: 'terms-of-service',
      title: 'Terms of Service Agreement',
      description: 'Returnly driver terms and conditions',
      category: 'legal',
      required: true,
      status: 'pending'
    },
    {
      id: 'privacy-policy-consent',
      title: 'Privacy Policy Consent',
      description: 'Consent to privacy policy and data handling',
      category: 'legal',
      required: true,
      status: 'pending'
    },
    {
      id: 'safety-training-cert',
      title: 'Safety Training Certificate',
      description: 'Completion of driver safety training program',
      category: 'legal',
      required: true,
      status: 'pending'
    },

    // Tax Documents
    {
      id: 'w9-form',
      title: 'W-9 Tax Form',
      description: 'IRS Form W-9 for tax reporting',
      category: 'tax',
      required: true,
      status: 'pending'
    },
    {
      id: 'bank-account-verification',
      title: 'Bank Account Verification',
      description: 'Voided check or bank account verification',
      category: 'tax',
      required: true,
      status: 'pending'
    }
  ];

  const categories = [
    { id: 'identity', name: 'Identity Documents', icon: User, color: 'bg-blue-500', count: 3 },
    { id: 'vehicle', name: 'Vehicle Documents', icon: Car, color: 'bg-green-500', count: 3 },
    { id: 'insurance', name: 'Insurance', icon: Shield, color: 'bg-purple-500', count: 2 },
    { id: 'background', name: 'Background Check', icon: AlertCircle, color: 'bg-yellow-500', count: 1 },
    { id: 'legal', name: 'Legal Agreements', icon: FileText, color: 'bg-red-500', count: 4 },
    { id: 'tax', name: 'Tax Documents', icon: CreditCard, color: 'bg-gray-500', count: 2 }
  ];

  const filteredDocuments = selectedCategory 
    ? requiredDocuments.filter(doc => doc.category === selectedCategory)
    : requiredDocuments;

  const completedCount = requiredDocuments.filter(doc => doc.status === 'approved').length;
  const totalRequired = requiredDocuments.filter(doc => doc.required).length;
  const progressPercentage = (completedCount / totalRequired) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'uploaded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'uploaded': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDocumentUpload = async (documentId: string) => {
    return {
      method: 'PUT' as const,
      url: `/api/driver-documents/${documentId}/upload`
    };
  };

  const handleUploadComplete = async (result: any, documentId: string) => {
    try {
      await apiRequest(`/api/driver-documents/${documentId}`, 'POST', {
        fileUrl: result.successful[0]?.uploadURL,
        status: 'uploaded'
      });
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully and is under review.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/driver-documents'] });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to save document. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the API
    // For now, we'll use the static data above
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Authentication Required</h2>
            <p className="text-amber-700 mb-4">Please sign in to access driver documents.</p>
            <Link href="/login">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/driver-portal">
            <Button variant="outline" className="mb-4" data-testid="button-back-driver-portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Driver Portal
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Driver Documents</h1>
              <p className="text-amber-700">Complete your driver onboarding by uploading required documents</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-900">{completedCount}/{totalRequired}</div>
                <div className="text-sm text-amber-600">Documents Complete</div>
              </div>
              <div className="w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-amber-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                    className="text-amber-600 transition-all duration-300"
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-lg font-bold fill-amber-900"
                  >
                    {Math.round(progressPercentage)}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Onboarding Progress</h3>
                <p className="text-amber-600">Complete all required documents to start driving</p>
              </div>
              {progressPercentage === 100 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ready to Drive
                </Badge>
              )}
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="mt-2 text-sm text-amber-600">
              {progressPercentage < 100 
                ? `${totalRequired - completedCount} more document${totalRequired - completedCount !== 1 ? 's' : ''} required`
                : 'All required documents completed!'
              }
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Document Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === null ? 'ring-2 ring-amber-400 bg-amber-50' : 'hover:bg-amber-50'
              }`}
              onClick={() => setSelectedCategory(null)}
              data-testid="category-all"
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <div className="font-medium text-amber-900">All</div>
                <div className="text-xs text-amber-600">{requiredDocuments.length}</div>
              </CardContent>
            </Card>
            
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-amber-400 bg-amber-50' : 'hover:bg-amber-50'
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`p-2 rounded-lg ${category.color} inline-flex mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="font-medium text-amber-900 text-sm leading-tight">{category.name}</div>
                    <div className="text-xs text-amber-600">{category.count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-4 mb-8">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        {getStatusIcon(document.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-amber-900">{document.title}</h3>
                          {document.required && (
                            <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{document.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge className={getStatusColor(document.status)}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </Badge>
                          
                          {document.uploadedAt && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                            </span>
                          )}
                          
                          {document.expiresAt && (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {new Date(document.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {document.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <strong>Note:</strong> {document.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {document.status === 'pending' && (
                      <ObjectUploader
                        maxNumberOfFiles={document.id === 'vehicle-photos' ? 4 : 1}
                        maxFileSize={10485760}
                        onGetUploadParameters={() => handleDocumentUpload(document.id)}
                        onComplete={(result) => handleUploadComplete(result, document.id)}
                        buttonClassName="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </ObjectUploader>
                    )}
                    
                    {document.status === 'uploaded' && (
                      <Button 
                        variant="outline" 
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        disabled
                        data-testid={`button-pending-${document.id}`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Under Review
                      </Button>
                    )}
                    
                    {document.status === 'approved' && (
                      <Button 
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        data-testid={`button-view-${document.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    )}
                    
                    {document.status === 'rejected' && (
                      <ObjectUploader
                        maxNumberOfFiles={document.id === 'vehicle-photos' ? 4 : 1}
                        maxFileSize={10485760}
                        onGetUploadParameters={() => handleDocumentUpload(document.id)}
                        onComplete={(result) => handleUploadComplete(result, document.id)}
                        buttonClassName="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Re-upload Document
                      </ObjectUploader>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Digital Signature Section */}
        {progressPercentage === 100 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Signature className="h-5 w-5" />
                Final Digital Signature
              </CardTitle>
              <CardDescription className="text-green-700">
                Complete your onboarding by providing your digital signature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-800">Full Legal Name</label>
                  <Input
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    placeholder="Type your full legal name"
                    className="border-green-200 focus:border-green-400"
                    data-testid="input-digital-signature"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreement"
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(!!checked)}
                    data-testid="checkbox-agreement"
                  />
                  <label htmlFor="agreement" className="text-sm text-green-800">
                    I agree that this digital signature has the same legal effect as a handwritten signature and 
                    certify that all uploaded documents are authentic and accurate.
                  </label>
                </div>
                
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!digitalSignature || !agreementAccepted}
                  data-testid="button-submit-signature"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help & Support */}
        <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Need Help with Documents?</h3>
              <p className="text-amber-100 mb-4">
                Our support team is available to help with document requirements and uploads
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-document-help">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support: (314) 555-0199
                </Button>
                <Button className="bg-white text-amber-600 hover:bg-amber-50" data-testid="button-document-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email: drivers@returnly.com
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}